import { Customer } from '../entities/Customer.js';

export class CustomerUseCase {
  constructor(customerRepository) {
    this.customerRepository = customerRepository;
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

  // すべての顧客を取得
  async getAllCustomers() {
    try {
      return await this.customerRepository.getAll();
    } catch (error) {
      throw new Error(`Failed to get all customers: ${error.message}`);
    }
  }

  // 顧客を検索
  async searchCustomers(query) {
    try {
      if (!query || query.trim() === '') {
        return await this.getAllCustomers();
      }
      return await this.customerRepository.search(query.toLowerCase());
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

  // 名前で顧客を検索
  async getCustomerByName(name) {
    try {
      return await this.customerRepository.getByName(name);
    } catch (error) {
      throw new Error(`Failed to get customer by name: ${error.message}`);
    }
  }
}