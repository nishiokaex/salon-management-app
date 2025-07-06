import { BookingServiceRepository } from '../../domain/repositories/BookingServiceRepository.js';
import { BookingService } from '../../domain/entities/BookingService.js';
import { AsyncStorageService } from '../storage/AsyncStorageService.js';

export class AsyncBookingServiceRepository extends BookingServiceRepository {
  constructor() {
    super();
    this.storageKey = 'bookingServices';
    this.storage = new AsyncStorageService();
  }

  async create(bookingService) {
    try {
      const bookingServices = await this.getAll();
      const newBookingService = new BookingService(bookingService);
      bookingServices.push(newBookingService);
      await this.storage.setItem(this.storageKey, bookingServices);
      return newBookingService;
    } catch (error) {
      throw new Error(`Failed to create booking service: ${error.message}`);
    }
  }

  async getById(id) {
    try {
      const bookingServices = await this.getAll();
      const bookingServiceData = bookingServices.find(bs => bs.id === id);
      return bookingServiceData ? new BookingService(bookingServiceData) : null;
    } catch (error) {
      throw new Error(`Failed to get booking service: ${error.message}`);
    }
  }

  async getAll() {
    try {
      const bookingServices = await this.storage.getItem(this.storageKey) || [];
      return bookingServices.map(bookingServiceData => new BookingService(bookingServiceData));
    } catch (error) {
      throw new Error(`Failed to get all booking services: ${error.message}`);
    }
  }

  async update(id, bookingService) {
    try {
      const bookingServices = await this.getAll();
      const index = bookingServices.findIndex(bs => bs.id === id);
      
      if (index === -1) {
        throw new Error('Booking service not found');
      }

      const updatedBookingService = new BookingService({ ...bookingServices[index], ...bookingService, id });
      bookingServices[index] = updatedBookingService;
      await this.storage.setItem(this.storageKey, bookingServices);
      return updatedBookingService;
    } catch (error) {
      throw new Error(`Failed to update booking service: ${error.message}`);
    }
  }

  async delete(id) {
    try {
      const bookingServices = await this.getAll();
      const filteredBookingServices = bookingServices.filter(bs => bs.id !== id);
      await this.storage.setItem(this.storageKey, filteredBookingServices);
      return true;
    } catch (error) {
      throw new Error(`Failed to delete booking service: ${error.message}`);
    }
  }

  async getByBookingId(bookingId) {
    try {
      const bookingServices = await this.getAll();
      return bookingServices.filter(bs => bs.bookingId === bookingId);
    } catch (error) {
      throw new Error(`Failed to get booking services by booking ID: ${error.message}`);
    }
  }

  async getByServiceId(serviceId) {
    try {
      const bookingServices = await this.getAll();
      return bookingServices.filter(bs => bs.serviceId === serviceId);
    } catch (error) {
      throw new Error(`Failed to get booking services by service ID: ${error.message}`);
    }
  }

  async deleteByBookingId(bookingId) {
    try {
      const bookingServices = await this.getAll();
      const filteredBookingServices = bookingServices.filter(bs => bs.bookingId !== bookingId);
      await this.storage.setItem(this.storageKey, filteredBookingServices);
      return true;
    } catch (error) {
      throw new Error(`Failed to delete booking services by booking ID: ${error.message}`);
    }
  }
}