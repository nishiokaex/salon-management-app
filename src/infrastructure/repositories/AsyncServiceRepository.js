import { ServiceRepository } from '../../domain/repositories/ServiceRepository.js';
import { Service } from '../../domain/entities/Service.js';
import { AsyncStorageService } from '../storage/AsyncStorageService.js';

export class AsyncServiceRepository extends ServiceRepository {
  constructor() {
    super();
    this.storageKey = 'services';
    this.storage = new AsyncStorageService();
  }

  async create(service) {
    try {
      const services = await this.getAll();
      const newService = new Service(service);
      services.push(newService);
      await this.storage.setItem(this.storageKey, services);
      return newService;
    } catch (error) {
      throw new Error(`Failed to create service: ${error.message}`);
    }
  }

  async getById(id) {
    try {
      const services = await this.getAll();
      const serviceData = services.find(s => s.id === id);
      return serviceData ? new Service(serviceData) : null;
    } catch (error) {
      throw new Error(`Failed to get service: ${error.message}`);
    }
  }

  async getAll() {
    try {
      const services = await this.storage.getItem(this.storageKey) || [];
      return services.map(serviceData => new Service(serviceData));
    } catch (error) {
      throw new Error(`Failed to get all services: ${error.message}`);
    }
  }

  async update(id, service) {
    try {
      const services = await this.getAll();
      const index = services.findIndex(s => s.id === id);
      
      if (index === -1) {
        throw new Error('Service not found');
      }

      const updatedService = new Service({ ...services[index], ...service, id });
      services[index] = updatedService;
      await this.storage.setItem(this.storageKey, services);
      return updatedService;
    } catch (error) {
      throw new Error(`Failed to update service: ${error.message}`);
    }
  }

  async delete(id) {
    try {
      const services = await this.getAll();
      const filteredServices = services.filter(s => s.id !== id);
      await this.storage.setItem(this.storageKey, filteredServices);
      return true;
    } catch (error) {
      throw new Error(`Failed to delete service: ${error.message}`);
    }
  }

  async getByCategory(category) {
    try {
      const services = await this.getAll();
      return services.filter(service => service.category === category);
    } catch (error) {
      throw new Error(`Failed to get services by category: ${error.message}`);
    }
  }

  async getActiveServices() {
    try {
      const services = await this.getAll();
      return services.filter(service => service.isActive);
    } catch (error) {
      throw new Error(`Failed to get active services: ${error.message}`);
    }
  }
}