import { Service } from '../entities/Service.js';

export class ServiceUseCase {
  constructor(serviceRepository) {
    this.serviceRepository = serviceRepository;
  }

  // サービスを作成
  async createService(serviceData) {
    try {
      const service = new Service(serviceData);
      return await this.serviceRepository.create(service);
    } catch (error) {
      throw new Error(`Failed to create service: ${error.message}`);
    }
  }

  // サービスを更新
  async updateService(id, updates) {
    try {
      const service = await this.serviceRepository.getById(id);
      if (!service) {
        throw new Error('Service not found');
      }

      service.updateService(updates);
      return await this.serviceRepository.update(id, service);
    } catch (error) {
      throw new Error(`Failed to update service: ${error.message}`);
    }
  }

  // すべてのサービスを取得
  async getAllServices() {
    try {
      return await this.serviceRepository.getAll();
    } catch (error) {
      throw new Error(`Failed to get all services: ${error.message}`);
    }
  }

  // 有効なサービスのみを取得
  async getActiveServices() {
    try {
      return await this.serviceRepository.getActiveServices();
    } catch (error) {
      throw new Error(`Failed to get active services: ${error.message}`);
    }
  }

  // カテゴリ別にサービスを取得
  async getServicesByCategory(category) {
    try {
      return await this.serviceRepository.getByCategory(category);
    } catch (error) {
      throw new Error(`Failed to get services by category: ${error.message}`);
    }
  }

  // サービスの有効/無効を切り替え
  async toggleServiceActive(id) {
    try {
      const service = await this.serviceRepository.getById(id);
      if (!service) {
        throw new Error('Service not found');
      }

      service.toggleActive();
      return await this.serviceRepository.update(id, service);
    } catch (error) {
      throw new Error(`Failed to toggle service active: ${error.message}`);
    }
  }

  // サービスを削除
  async deleteService(id) {
    try {
      return await this.serviceRepository.delete(id);
    } catch (error) {
      throw new Error(`Failed to delete service: ${error.message}`);
    }
  }
}