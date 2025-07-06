import { Customer } from '../entities/Customer.js';

export class CustomerUseCase {
  constructor(customerRepository, bookingRepository) {
    this.customerRepository = customerRepository;
    this.bookingRepository = bookingRepository;
  }

  // 顧客を作成
  async createCustomer(customerData) {
    try {
      const customer = new Customer(customerData);
      return await this.customerRepository.create(customer);
    } catch (error) {
      throw new Error(`Failed to create customer: ${error.message}`);
    }
  }

  // 顧客を更新
  async updateCustomer(id, updates) {
    try {
      const customer = await this.customerRepository.getById(id);
      if (!customer) {
        throw new Error('Customer not found');
      }

      customer.updateCustomer(updates);
      return await this.customerRepository.update(id, customer);
    } catch (error) {
      throw new Error(`Failed to update customer: ${error.message}`);
    }
  }

  // すべての顧客を取得（リアルタイム計算対応）
  async getAllCustomers() {
    try {
      const customers = await this.customerRepository.getAll();
      const allBookings = await this.bookingRepository.getAll();
      
      // 各顧客に関連する予約データを設定
      const enrichedCustomers = customers.map(customerData => {
        const customer = new Customer(customerData);
        const customerBookings = allBookings.filter(booking => 
          booking.customerId === customer.id || booking.customerName === customer.name
        );
        customer.setBookings(customerBookings);
        return customer;
      });
      
      return enrichedCustomers;
    } catch (error) {
      throw new Error(`Failed to get all customers: ${error.message}`);
    }
  }

  // 顧客の来店統計を計算
  async calculateVisitStats(customerId) {
    try {
      const bookings = await this.bookingRepository.getByCustomerId(customerId);
      const completedBookings = bookings.filter(booking => booking.status === 'completed');
      
      const visitCount = completedBookings.length;
      const lastVisit = completedBookings.length > 0 
        ? completedBookings
            .map(booking => new Date(booking.date))
            .sort((a, b) => b - a)[0]
            .toISOString()
        : null;
      
      return { visitCount, lastVisit };
    } catch (error) {
      throw new Error(`Failed to calculate visit stats: ${error.message}`);
    }
  }

  // 顧客を検索（リアルタイム計算対応）
  async searchCustomers(query) {
    try {
      if (!query || query.trim() === '') {
        return await this.getAllCustomers();
      }
      
      // 全顧客を取得してから検索（リアルタイム計算データを使用）
      const allCustomers = await this.getAllCustomers();
      const filteredCustomers = allCustomers.filter(customer =>
        customer.getSearchableString().includes(query.toLowerCase())
      );

      return filteredCustomers;
    } catch (error) {
      throw new Error(`Failed to search customers: ${error.message}`);
    }
  }

  // 顧客を削除
  async deleteCustomer(id) {
    try {
      return await this.customerRepository.delete(id);
    } catch (error) {
      throw new Error(`Failed to delete customer: ${error.message}`);
    }
  }

  // 顧客の詳細情報を取得
  async getCustomerById(id) {
    try {
      return await this.customerRepository.getById(id);
    } catch (error) {
      throw new Error(`Failed to get customer by id: ${error.message}`);
    }
  }

  // 顧客の詳細情報を取得（リアルタイム計算対応）
  async getEnrichedCustomerById(id) {
    try {
      const customerData = await this.customerRepository.getById(id);
      if (!customerData) {
        return null;
      }

      const customer = new Customer(customerData);
      const customerBookings = await this.bookingRepository.getByCustomerId(id);
      customer.setBookings(customerBookings);
      
      return customer;
    } catch (error) {
      throw new Error(`Failed to get enriched customer by id: ${error.message}`);
    }
  }

  // 名前で顧客を検索
  async getCustomerByName(name) {
    try {
      return await this.customerRepository.getByName(name);
    } catch (error) {
      throw new Error(`Failed to get customer by name: ${error.message}`);
    }
  }
}