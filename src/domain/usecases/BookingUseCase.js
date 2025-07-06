import { Booking } from '../entities/Booking.js';

export class BookingUseCase {
  constructor(bookingRepository, customerRepository, bookingServiceRepository, serviceRepository) {
    this.bookingRepository = bookingRepository;
    this.customerRepository = customerRepository;
    this.bookingServiceRepository = bookingServiceRepository;
    this.serviceRepository = serviceRepository;
  }

  // 予約を作成（正規化対応・顧客名解決付き）
  async createBooking(bookingData) {
    try {
      // customerId の解決（後方互換性のためcustomerNameからも検索）
      let customerId = bookingData.customerId;
      let customerName = bookingData.customerName;
      
      if (!customerId && customerName) {
        // customerNameから顧客を検索
        const customer = await this.customerRepository.getByName(customerName);
        if (customer) {
          customerId = customer.id;
        }
      }
      
      // 基本予約情報を作成
      const booking = new Booking({
        customerId: customerId,
        date: bookingData.date,
        time: bookingData.time,
        notes: bookingData.notes || '',
        totalPrice: bookingData.price || 0, // 後方互換性
        totalDuration: 0,
        customerName: customerName // 後方互換性のため保存
      });
      
      const createdBooking = await this.bookingRepository.create(booking);
      
      // サービス情報があれば予約サービスも作成
      if (bookingData.services && bookingData.services.length > 0) {
        let totalPrice = 0;
        let totalDuration = 0;
        
        for (const serviceData of bookingData.services) {
          const bookingService = {
            bookingId: createdBooking.id,
            serviceId: serviceData.serviceId,
            price: serviceData.price,
            duration: serviceData.duration,
            staffMember: serviceData.staffMember || '',
            notes: serviceData.notes || ''
          };
          
          await this.bookingServiceRepository.create(bookingService);
          totalPrice += serviceData.price;
          totalDuration += serviceData.duration;
        }
        
        // 合計金額と時間を更新
        createdBooking.totalPrice = totalPrice;
        createdBooking.totalDuration = totalDuration;
        await this.bookingRepository.update(createdBooking.id, createdBooking);
      } else if (bookingData.price && bookingData.service) {
        // 旧形式のデータがある場合は、totalPriceを設定
        createdBooking.totalPrice = bookingData.price;
        createdBooking.totalDuration = 60; // デフォルト60分
        await this.bookingRepository.update(createdBooking.id, createdBooking);
      }
      
      // 顧客名の解決と設定
      const enrichedBooking = new Booking(createdBooking);
      if (customerId) {
        const customer = await this.customerRepository.getById(customerId);
        enrichedBooking.customerName = customer ? customer.name : customerName || '不明な顧客';
        enrichedBooking.customerId = customerId;
      } else {
        enrichedBooking.customerName = customerName || '不明な顧客';
      }
      
      return enrichedBooking;
    } catch (error) {
      throw new Error(`Failed to create booking: ${error.message}`);
    }
  }

  // 予約を更新（顧客名解決付き）
  async updateBooking(id, updates) {
    try {
      const booking = await this.bookingRepository.getById(id);
      if (!booking) {
        throw new Error('Booking not found');
      }

      booking.updateBooking(updates);
      const updatedBooking = await this.bookingRepository.update(id, booking);
      
      // 顧客名の解決
      const enrichedBooking = new Booking(updatedBooking);
      if (enrichedBooking.customerId) {
        const customer = await this.customerRepository.getById(enrichedBooking.customerId);
        enrichedBooking.customerName = customer ? customer.name : '不明な顧客';
      } else if (enrichedBooking.customerName) {
        // 既に設定されている場合はそのまま
      } else {
        enrichedBooking.customerName = '不明な顧客';
      }
      
      return enrichedBooking;
    } catch (error) {
      throw new Error(`Failed to update booking: ${error.message}`);
    }
  }

  // 予約状態を変更（顧客名解決付き）
  async updateBookingStatus(id, status) {
    try {
      const booking = await this.bookingRepository.getById(id);
      if (!booking) {
        throw new Error('Booking not found');
      }

      const oldStatus = booking.status;
      booking.updateStatus(status);
      const updatedBooking = await this.bookingRepository.update(id, booking);
      
      // 顧客名の解決
      const enrichedBooking = new Booking(updatedBooking);
      if (enrichedBooking.customerId) {
        const customer = await this.customerRepository.getById(enrichedBooking.customerId);
        enrichedBooking.customerName = customer ? customer.name : '不明な顧客';
      } else if (enrichedBooking.customerName) {
        // 既に設定されている場合はそのまま
      } else {
        enrichedBooking.customerName = '不明な顧客';
      }
      
      return enrichedBooking;
    } catch (error) {
      throw new Error(`Failed to update booking status: ${error.message}`);
    }
  }

  // すべての予約を取得（正規化対応）
  async getAllBookings() {
    try {
      const bookings = await this.bookingRepository.getAll();
      
      // 各予約に対して顧客情報とサービス情報を取得
      const enrichedBookings = await Promise.all(
        bookings.map(async (booking) => {
          const customer = await this.customerRepository.getById(booking.customerId);
          const bookingServices = await this.bookingServiceRepository.getByBookingId(booking.id);
          
          // サービス詳細情報を取得
          const services = await Promise.all(
            bookingServices.map(async (bs) => {
              const service = await this.serviceRepository.getById(bs.serviceId);
              return {
                ...bs,
                serviceName: service ? service.name : '不明なサービス',
                serviceDescription: service ? service.description : ''
              };
            })
          );
          
          // Bookingインスタンスのメソッドを保持しつつ追加情報を付与
          const enrichedBooking = new Booking(booking);
          
          // 顧客名の設定（後方互換性のためbookingDataのcustomerNameも考慮）
          if (customer) {
            enrichedBooking.customerName = customer.name;
          } else if (booking.customerName) {
            enrichedBooking.customerName = booking.customerName;
          } else {
            enrichedBooking.customerName = '不明な顧客';
          }
          
          enrichedBooking.customer = customer;
          enrichedBooking.services = services;
          
          // 互換性のために古い形式のpriceとserviceも設定
          enrichedBooking.price = booking.totalPrice;
          if (services.length > 0) {
            enrichedBooking.service = services.map(s => s.serviceName).join(', ');
          } else if (booking.notes) {
            // サービス情報がない場合はnotesから取得
            enrichedBooking.service = booking.notes;
          } else {
            enrichedBooking.service = '施術内容なし';
          }
          
          return enrichedBooking;
        })
      );
      
      return enrichedBookings;
    } catch (error) {
      throw new Error(`Failed to get all bookings: ${error.message}`);
    }
  }

  // 特定の日付の予約を取得（顧客名解決付き）
  async getBookingsByDate(date) {
    try {
      const bookings = await this.bookingRepository.getByDate(date);
      
      // 各予約に対して顧客情報を取得
      const enrichedBookings = await Promise.all(
        bookings.map(async (booking) => {
          const enrichedBooking = new Booking(booking);
          
          // 顧客名の解決
          if (booking.customerId) {
            const customer = await this.customerRepository.getById(booking.customerId);
            enrichedBooking.customerName = customer ? customer.name : '不明な顧客';
          } else if (booking.customerName) {
            enrichedBooking.customerName = booking.customerName;
          } else {
            enrichedBooking.customerName = '不明な顧客';
          }
          
          return enrichedBooking;
        })
      );
      
      return enrichedBookings;
    } catch (error) {
      throw new Error(`Failed to get bookings by date: ${error.message}`);
    }
  }

  // 顧客の予約履歴を取得（顧客名解決付き）
  async getBookingsByCustomer(customerId) {
    try {
      const bookings = await this.bookingRepository.getByCustomerId(customerId);
      const customer = await this.customerRepository.getById(customerId);
      
      // 各予約に顧客名を設定
      const enrichedBookings = bookings.map(booking => {
        const enrichedBooking = new Booking(booking);
        enrichedBooking.customerName = customer ? customer.name : '不明な顧客';
        return enrichedBooking;
      });
      
      return enrichedBookings;
    } catch (error) {
      throw new Error(`Failed to get bookings by customer: ${error.message}`);
    }
  }

  // 予約を削除
  async deleteBooking(id) {
    try {
      return await this.bookingRepository.delete(id);
    } catch (error) {
      throw new Error(`Failed to delete booking: ${error.message}`);
    }
  }
}