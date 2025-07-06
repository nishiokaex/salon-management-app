import { CustomerRepository } from '../../domain/repositories/CustomerRepository.js';
import { AsyncStorageService } from '../storage/AsyncStorageService.js';
import { Customer } from '../../domain/entities/Customer.js';

export class AsyncCustomerRepository extends CustomerRepository {
  constructor() {
    super();
    this.storage = new AsyncStorageService();
    this.key = 'customers';
  }

  async getAll() {
    const data = await this.storage.getArray(this.key);
    return data.map(item => new Customer(item));
  }

  async getById(id) {
    const customer = await this.storage.findInArray(this.key, item => item.id === id);
    return customer ? new Customer(customer) : null;
  }

  async create(customer) {
    const customerData = { ...customer };
    await this.storage.addToArray(this.key, customerData);
    return new Customer(customerData);
  }

  async update(id, updates) {
    const updatedData = await this.storage.updateInArray(this.key, id, updates);
    return updatedData ? new Customer(updatedData) : null;
  }

  async delete(id) {
    await this.storage.removeFromArray(this.key, id);
    return true;
  }

  async search(query) {
    const customers = await this.storage.filterArray(this.key, item => {
      const customer = new Customer(item);
      return customer.getSearchableString().includes(query);
    });
    return customers.map(item => new Customer(item));
  }

  async getByName(name) {
    const customer = await this.storage.findInArray(this.key, item => 
      item.name.toLowerCase() === name.toLowerCase()
    );
    return customer ? new Customer(customer) : null;
  }

  async getByPhone(phone) {
    const customer = await this.storage.findInArray(this.key, item => item.phone === phone);
    return customer ? new Customer(customer) : null;
  }

  async getByEmail(email) {
    const customer = await this.storage.findInArray(this.key, item => 
      item.email.toLowerCase() === email.toLowerCase()
    );
    return customer ? new Customer(customer) : null;
  }

  async getTotalCount() {
    const customers = await this.getAll();
    return customers.length;
  }
}