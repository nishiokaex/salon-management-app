import { BookingRepository } from '../../domain/repositories/BookingRepository.js';
import { AsyncStorageService } from '../storage/AsyncStorageService.js';
import { Booking } from '../../domain/entities/Booking.js';

export class AsyncBookingRepository extends BookingRepository {
  constructor() {
    super();
    this.storage = new AsyncStorageService();
    this.key = 'bookings';
  }

  async getAll() {
    const data = await this.storage.getArray(this.key);
    return data.map(item => new Booking(item));
  }

  async getById(id) {
    const booking = await this.storage.findInArray(this.key, item => item.id === id);
    return booking ? new Booking(booking) : null;
  }

  async create(booking) {
    const bookingData = { ...booking };
    await this.storage.addToArray(this.key, bookingData);
    return new Booking(bookingData);
  }

  async update(id, updates) {
    const updatedData = await this.storage.updateInArray(this.key, id, updates);
    return updatedData ? new Booking(updatedData) : null;
  }

  async delete(id) {
    await this.storage.removeFromArray(this.key, id);
    return true;
  }

  async getByDate(date) {
    const bookings = await this.storage.filterArray(this.key, item => item.date === date);
    return bookings.map(item => new Booking(item));
  }

  async getByCustomerId(customerId) {
    const bookings = await this.storage.filterArray(this.key, item => item.customerId === customerId);
    return bookings.map(item => new Booking(item));
  }

  async getByStatus(status) {
    const bookings = await this.storage.filterArray(this.key, item => item.status === status);
    return bookings.map(item => new Booking(item));
  }

  async getTodayBookings() {
    const today = new Date().toISOString().split('T')[0];
    return await this.getByDate(today);
  }

  async getTotalRevenue() {
    const bookings = await this.getAll();
    return bookings
      .filter(booking => booking.status === 'completed')
      .reduce((total, booking) => total + (booking.price || 0), 0);
  }

  async getTodayRevenue() {
    const todayBookings = await this.getTodayBookings();
    return todayBookings
      .filter(booking => booking.status === 'completed')
      .reduce((total, booking) => total + (booking.price || 0), 0);
  }
}