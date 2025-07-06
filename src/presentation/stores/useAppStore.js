import { create } from 'zustand';
import { AsyncBookingRepository } from '../../infrastructure/repositories/AsyncBookingRepository.js';
import { AsyncCustomerRepository } from '../../infrastructure/repositories/AsyncCustomerRepository.js';
import { AsyncProductRepository } from '../../infrastructure/repositories/AsyncProductRepository.js';
import { AsyncServiceRepository } from '../../infrastructure/repositories/AsyncServiceRepository.js';
import { AsyncBookingServiceRepository } from '../../infrastructure/repositories/AsyncBookingServiceRepository.js';
import { BookingUseCase } from '../../domain/usecases/BookingUseCase.js';
import { CustomerUseCase } from '../../domain/usecases/CustomerUseCase.js';
import { ProductUseCase } from '../../domain/usecases/ProductUseCase.js';
import { ServiceUseCase } from '../../domain/usecases/ServiceUseCase.js';
import { DashboardUseCase } from '../../domain/usecases/DashboardUseCase.js';
import { getErrorLogger } from '../../infrastructure/logging/setupErrorHandlers.js';

class AppStore {
  constructor() {
    // エラーロガー
    this.errorLogger = getErrorLogger();
    
    // リポジトリインスタンス
    this.bookingRepository = new AsyncBookingRepository();
    this.customerRepository = new AsyncCustomerRepository();
    this.productRepository = new AsyncProductRepository();
    this.serviceRepository = new AsyncServiceRepository();
    this.bookingServiceRepository = new AsyncBookingServiceRepository();

    // ユースケースインスタンス
    this.bookingUseCase = new BookingUseCase(
      this.bookingRepository, 
      this.customerRepository, 
      this.bookingServiceRepository, 
      this.serviceRepository
    );
    this.customerUseCase = new CustomerUseCase(this.customerRepository, this.bookingRepository);
    this.productUseCase = new ProductUseCase(this.productRepository);
    this.serviceUseCase = new ServiceUseCase(this.serviceRepository);
    this.dashboardUseCase = new DashboardUseCase(
      this.bookingRepository,
      this.customerRepository,
      this.productRepository
    );

    // 初期状態
    this.state = {
      // 予約管理
      bookings: [],
      bookingLoading: false,
      bookingError: null,

      // 顧客管理
      customers: [],
      customerLoading: false,
      customerError: null,

      // 在庫管理
      products: [],
      productLoading: false,
      productError: null,

      // サービス管理
      services: [],
      serviceLoading: false,
      serviceError: null,

      // ダッシュボード
      dashboardSummary: null,
      dashboardLoading: false,
      dashboardError: null,
    };
  }

  // 予約関連アクション
  async loadBookings() {
    this.setState({ bookingLoading: true, bookingError: null });
    try {
      const bookings = await this.bookingUseCase.getAllBookings();
      this.setState({ bookings, bookingLoading: false });
    } catch (error) {
      console.error('loadBookings error:', error);
      this.errorLogger.logCustomError('Failed to load bookings', {
        action: 'loadBookings',
        error: error.message,
        stack: error.stack
      });
      this.setState({ bookingError: error.message, bookingLoading: false });
    }
  }

  async createBooking(bookingData) {
    this.setState({ bookingLoading: true, bookingError: null });
    try {
      const newBooking = await this.bookingUseCase.createBooking(bookingData);
      this.setState(state => ({
        bookings: [...state.bookings, newBooking],
        bookingLoading: false
      }));
      
      // リアルタイム計算により、顧客データの手動更新は不要
      this.refreshCustomersWithCurrentBookings();
      this.loadDashboardSummary();
      
      return newBooking;
    } catch (error) {
      this.setState({ bookingError: error.message, bookingLoading: false });
      throw error;
    }
  }

  async updateBooking(id, updates) {
    this.setState({ bookingLoading: true, bookingError: null });
    try {
      const updatedBooking = await this.bookingUseCase.updateBooking(id, updates);
      this.setState(state => ({
        bookings: state.bookings.map(b => b.id === id ? updatedBooking : b),
        bookingLoading: false
      }));
      
      // リアルタイム計算により、顧客データの手動更新は不要
      this.refreshCustomersWithCurrentBookings();
      this.loadDashboardSummary();
      
      return updatedBooking;
    } catch (error) {
      this.setState({ bookingError: error.message, bookingLoading: false });
      throw error;
    }
  }

  async updateBookingStatus(id, status) {
    this.setState({ bookingLoading: true, bookingError: null });
    try {
      const updatedBooking = await this.bookingUseCase.updateBookingStatus(id, status);
      this.setState(state => ({
        bookings: state.bookings.map(b => b.id === id ? updatedBooking : b),
        bookingLoading: false
      }));
      
      // リアルタイム計算により、顧客データの手動更新は不要
      // ただし、顧客画面が表示されている場合のリフレッシュのため、軽量な更新を行う
      this.refreshCustomersWithCurrentBookings();
      this.loadDashboardSummary(); // ダッシュボードも更新
      
      return updatedBooking;
    } catch (error) {
      this.setState({ bookingError: error.message, bookingLoading: false });
      throw error;
    }
  }

  async deleteBooking(id) {
    this.setState({ bookingLoading: true, bookingError: null });
    try {
      await this.bookingUseCase.deleteBooking(id);
      this.setState(state => ({
        bookings: state.bookings.filter(b => b.id !== id),
        bookingLoading: false
      }));
      
      // リアルタイム計算により、顧客データの手動更新は不要
      this.refreshCustomersWithCurrentBookings();
      this.loadDashboardSummary();
    } catch (error) {
      this.setState({ bookingError: error.message, bookingLoading: false });
      throw error;
    }
  }

  // 顧客関連アクション
  async loadCustomers() {
    this.setState({ customerLoading: true, customerError: null });
    try {
      const customers = await this.customerUseCase.getAllCustomers();
      this.setState({ customers, customerLoading: false });
      
      // データロード後、現在の予約データで顧客データを同期
      this.refreshCustomersWithCurrentBookings();
    } catch (error) {
      this.setState({ customerError: error.message, customerLoading: false });
    }
  }

  async createCustomer(customerData) {
    this.setState({ customerLoading: true, customerError: null });
    try {
      const newCustomer = await this.customerUseCase.createCustomer(customerData);
      this.setState(state => ({
        customers: [...state.customers, newCustomer],
        customerLoading: false
      }));
      return newCustomer;
    } catch (error) {
      this.setState({ customerError: error.message, customerLoading: false });
      throw error;
    }
  }

  async updateCustomer(id, updates) {
    this.setState({ customerLoading: true, customerError: null });
    try {
      const updatedCustomer = await this.customerUseCase.updateCustomer(id, updates);
      this.setState(state => ({
        customers: state.customers.map(c => c.id === id ? updatedCustomer : c),
        customerLoading: false
      }));
      return updatedCustomer;
    } catch (error) {
      this.setState({ customerError: error.message, customerLoading: false });
      throw error;
    }
  }

  async searchCustomers(query) {
    this.setState({ customerLoading: true, customerError: null });
    try {
      const customers = await this.customerUseCase.searchCustomers(query);
      this.setState({ customers, customerLoading: false });
    } catch (error) {
      this.setState({ customerError: error.message, customerLoading: false });
    }
  }

  // 特定の顧客情報を更新（来店回数など）
  async refreshCustomer(customerId) {
    try {
      const updatedCustomer = await this.customerUseCase.getEnrichedCustomerById(customerId);
      if (updatedCustomer) {
        this.setState(state => ({
          customers: state.customers.map(c => c.id === customerId ? updatedCustomer : c)
        }));
      }
    } catch (error) {
      console.error('Failed to refresh customer:', error);
      // エラーが発生した場合は全体を再読み込み
      this.loadCustomers();
    }
  }

  // 現在の予約データを使って顧客データをリフレッシュ
  refreshCustomersWithCurrentBookings() {
    this.setState(state => {
      const { Customer } = require('../../domain/entities/Customer.js');
      const updatedCustomers = state.customers.map(customer => {
        // 新しいCustomerインスタンスを作成
        const refreshedCustomer = new Customer(customer);
        // 現在の予約データを設定
        const customerBookings = state.bookings.filter(booking => 
          booking.customerId === customer.id || booking.customerName === customer.name
        );
        refreshedCustomer.setBookings(customerBookings);
        return refreshedCustomer;
      });
      
      return { customers: updatedCustomers };
    });
  }

  // 在庫関連アクション
  async loadProducts() {
    this.setState({ productLoading: true, productError: null });
    try {
      const products = await this.productUseCase.getAllProducts();
      this.setState({ products, productLoading: false });
    } catch (error) {
      this.setState({ productError: error.message, productLoading: false });
    }
  }

  async createProduct(productData) {
    this.setState({ productLoading: true, productError: null });
    try {
      const newProduct = await this.productUseCase.createProduct(productData);
      this.setState(state => ({
        products: [...state.products, newProduct],
        productLoading: false
      }));
      return newProduct;
    } catch (error) {
      this.setState({ productError: error.message, productLoading: false });
      throw error;
    }
  }

  async updateProduct(id, updates) {
    this.setState({ productLoading: true, productError: null });
    try {
      const updatedProduct = await this.productUseCase.updateProduct(id, updates);
      this.setState(state => ({
        products: state.products.map(p => p.id === id ? updatedProduct : p),
        productLoading: false
      }));
      return updatedProduct;
    } catch (error) {
      this.setState({ productError: error.message, productLoading: false });
      throw error;
    }
  }

  async adjustStock(id, quantity) {
    this.setState({ productLoading: true, productError: null });
    try {
      const updatedProduct = await this.productUseCase.adjustStock(id, quantity);
      this.setState(state => ({
        products: state.products.map(p => p.id === id ? updatedProduct : p),
        productLoading: false
      }));
      return updatedProduct;
    } catch (error) {
      this.setState({ productError: error.message, productLoading: false });
      throw error;
    }
  }

  // サービス関連アクション
  async loadServices() {
    this.setState({ serviceLoading: true, serviceError: null });
    try {
      const services = await this.serviceUseCase.getAllServices();
      this.setState({ services, serviceLoading: false });
    } catch (error) {
      this.setState({ serviceError: error.message, serviceLoading: false });
    }
  }

  async createService(serviceData) {
    this.setState({ serviceLoading: true, serviceError: null });
    try {
      const newService = await this.serviceUseCase.createService(serviceData);
      this.setState(state => ({
        services: [...state.services, newService],
        serviceLoading: false
      }));
      return newService;
    } catch (error) {
      this.setState({ serviceError: error.message, serviceLoading: false });
      throw error;
    }
  }

  async updateService(id, updates) {
    this.setState({ serviceLoading: true, serviceError: null });
    try {
      const updatedService = await this.serviceUseCase.updateService(id, updates);
      this.setState(state => ({
        services: state.services.map(s => s.id === id ? updatedService : s),
        serviceLoading: false
      }));
      return updatedService;
    } catch (error) {
      this.setState({ serviceError: error.message, serviceLoading: false });
      throw error;
    }
  }

  async toggleServiceActive(id) {
    this.setState({ serviceLoading: true, serviceError: null });
    try {
      const updatedService = await this.serviceUseCase.toggleServiceActive(id);
      this.setState(state => ({
        services: state.services.map(s => s.id === id ? updatedService : s),
        serviceLoading: false
      }));
      return updatedService;
    } catch (error) {
      this.setState({ serviceError: error.message, serviceLoading: false });
      throw error;
    }
  }

  // ダッシュボード関連アクション
  async loadDashboardSummary() {
    this.setState({ dashboardLoading: true, dashboardError: null });
    try {
      const summary = await this.dashboardUseCase.getDashboardSummary();
      this.setState({ dashboardSummary: summary, dashboardLoading: false });
    } catch (error) {
      this.setState({ dashboardError: error.message, dashboardLoading: false });
    }
  }

  // 状態更新用のヘルパー
  setState(updates) {
    if (typeof updates === 'function') {
      this.state = updates(this.state);
    } else {
      this.state = { ...this.state, ...updates };
    }
  }
}

export const useAppStore = create((set, get) => {
  const store = new AppStore();
  
  // Zustandの状態更新を処理
  store.setState = (updates) => {
    if (typeof updates === 'function') {
      set(updates);
    } else {
      set(updates);
    }
  };

  return {
    ...store.state,
    // 予約関連アクション
    loadBookings: store.loadBookings.bind(store),
    createBooking: store.createBooking.bind(store),
    updateBooking: store.updateBooking.bind(store),
    updateBookingStatus: store.updateBookingStatus.bind(store),
    deleteBooking: store.deleteBooking.bind(store),
    // 顧客関連アクション
    loadCustomers: store.loadCustomers.bind(store),
    createCustomer: store.createCustomer.bind(store),
    updateCustomer: store.updateCustomer.bind(store),
    searchCustomers: store.searchCustomers.bind(store),
    // 在庫関連アクション
    loadProducts: store.loadProducts.bind(store),
    createProduct: store.createProduct.bind(store),
    updateProduct: store.updateProduct.bind(store),
    adjustStock: store.adjustStock.bind(store),
    // サービス関連アクション
    loadServices: store.loadServices.bind(store),
    createService: store.createService.bind(store),
    updateService: store.updateService.bind(store),
    toggleServiceActive: store.toggleServiceActive.bind(store),
    // ダッシュボード関連アクション
    loadDashboardSummary: store.loadDashboardSummary.bind(store),
  };
});