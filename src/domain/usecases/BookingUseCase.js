import { Booking } from '../entities/Booking.js';

export class BookingUseCase {
  constructor(bookingRepository, customerRepository) {
    this.bookingRepository = bookingRepository;
    this.customerRepository = customerRepository;
  }

  // 予約を作成
  async createBooking(bookingData) {
    try {
      const booking = new Booking(bookingData);
      return await this.bookingRepository.create(booking);
    } catch (error) {
      throw new Error(`Failed to create booking: ${error.message}`);
    }
  }

  // 予約を更新
  async updateBooking(id, updates) {
    try {
      const booking = await this.bookingRepository.getById(id);
      if (!booking) {
        throw new Error('Booking not found');
      }

      booking.updateBooking(updates);
      return await this.bookingRepository.update(id, booking);
    } catch (error) {
      throw new Error(`Failed to update booking: ${error.message}`);
    }
  }

  // 予約状態を変更
  async updateBookingStatus(id, status) {
    try {
      const booking = await this.bookingRepository.getById(id);
      if (!booking) {
        throw new Error('Booking not found');
      }

      const oldStatus = booking.status;
      booking.updateStatus(status);
      const updatedBooking = await this.bookingRepository.update(id, booking);
      
      // 予約が完了状態に変更された場合、顧客の来店回数を増やす
      if (status === 'completed' && oldStatus !== 'completed' && booking.customerId) {
        const customer = await this.customerRepository.getById(booking.customerId);
        if (customer) {
          customer.incrementVisitCount();
          await this.customerRepository.update(customer.id, customer);
        }
      }
      
      return updatedBooking;
    } catch (error) {
      throw new Error(`Failed to update booking status: ${error.message}`);
    }
  }

  // すべての予約を取得
  async getAllBookings() {
    try {
      return await this.bookingRepository.getAll();
    } catch (error) {
      throw new Error(`Failed to get all bookings: ${error.message}`);
    }
  }

  // 特定の日付の予約を取得
  async getBookingsByDate(date) {
    try {
      return await this.bookingRepository.getByDate(date);
    } catch (error) {
      throw new Error(`Failed to get bookings by date: ${error.message}`);
    }
  }

  // 顧客の予約履歴を取得
  async getBookingsByCustomer(customerId) {
    try {
      return await this.bookingRepository.getByCustomerId(customerId);
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