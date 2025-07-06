import { ProductRepository } from '../../domain/repositories/ProductRepository.js';
import { AsyncStorageService } from '../storage/AsyncStorageService.js';
import { Product } from '../../domain/entities/Product.js';

export class AsyncProductRepository extends ProductRepository {
  constructor() {
    super();
    this.storage = new AsyncStorageService();
    this.key = 'products';
  }

  async getAll() {
    const data = await this.storage.getArray(this.key);
    return data.map(item => new Product(item));
  }

  async getById(id) {
    const product = await this.storage.findInArray(this.key, item => item.id === id);
    return product ? new Product(product) : null;
  }

  async create(product) {
    const productData = { ...product };
    await this.storage.addToArray(this.key, productData);
    return new Product(productData);
  }

  async update(id, updates) {
    const updatedData = await this.storage.updateInArray(this.key, id, updates);
    return updatedData ? new Product(updatedData) : null;
  }

  async delete(id) {
    await this.storage.removeFromArray(this.key, id);
    return true;
  }

  async getByCategory(category) {
    const products = await this.storage.filterArray(this.key, item => item.category === category);
    return products.map(item => new Product(item));
  }

  async getLowStockProducts() {
    const products = await this.storage.filterArray(this.key, item => {
      const product = new Product(item);
      return product.isLowStock();
    });
    return products.map(item => new Product(item));
  }

  async search(query) {
    const products = await this.storage.filterArray(this.key, item => 
      item.name.toLowerCase().includes(query) || 
      item.category.toLowerCase().includes(query)
    );
    return products.map(item => new Product(item));
  }

  async getTotalValue() {
    const products = await this.getAll();
    return products.reduce((total, product) => 
      total + (product.currentStock * product.sellingPrice), 0
    );
  }

  async getLowStockCount() {
    const lowStockProducts = await this.getLowStockProducts();
    return lowStockProducts.length;
  }
}