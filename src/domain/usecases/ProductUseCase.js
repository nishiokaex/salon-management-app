import { Product } from '../entities/Product.js';

export class ProductUseCase {
  constructor(productRepository) {
    this.productRepository = productRepository;
  }

  // 商品を作成
  async createProduct(productData) {
    try {
      const product = new Product(productData);
      return await this.productRepository.create(product);
    } catch (error) {
      throw new Error(`Failed to create product: ${error.message}`);
    }
  }

  // 商品を更新
  async updateProduct(id, updates) {
    try {
      const product = await this.productRepository.getById(id);
      if (!product) {
        throw new Error('Product not found');
      }

      product.updateProduct(updates);
      return await this.productRepository.update(id, product);
    } catch (error) {
      throw new Error(`Failed to update product: ${error.message}`);
    }
  }

  // 在庫を調整
  async adjustStock(id, quantity) {
    try {
      const product = await this.productRepository.getById(id);
      if (!product) {
        throw new Error('Product not found');
      }

      product.adjustStock(quantity);
      return await this.productRepository.update(id, product);
    } catch (error) {
      throw new Error(`Failed to adjust stock: ${error.message}`);
    }
  }

  // すべての商品を取得
  async getAllProducts() {
    try {
      return await this.productRepository.getAll();
    } catch (error) {
      throw new Error(`Failed to get all products: ${error.message}`);
    }
  }

  // 在庫不足商品を取得
  async getLowStockProducts() {
    try {
      return await this.productRepository.getLowStockProducts();
    } catch (error) {
      throw new Error(`Failed to get low stock products: ${error.message}`);
    }
  }

  // 商品を検索
  async searchProducts(query) {
    try {
      if (!query || query.trim() === '') {
        return await this.getAllProducts();
      }
      return await this.productRepository.search(query.toLowerCase());
    } catch (error) {
      throw new Error(`Failed to search products: ${error.message}`);
    }
  }

  // 商品を削除
  async deleteProduct(id) {
    try {
      return await this.productRepository.delete(id);
    } catch (error) {
      throw new Error(`Failed to delete product: ${error.message}`);
    }
  }

  // カテゴリ別商品を取得
  async getProductsByCategory(category) {
    try {
      return await this.productRepository.getByCategory(category);
    } catch (error) {
      throw new Error(`Failed to get products by category: ${error.message}`);
    }
  }

  // 商品の詳細情報を取得
  async getProductById(id) {
    try {
      return await this.productRepository.getById(id);
    } catch (error) {
      throw new Error(`Failed to get product by id: ${error.message}`);
    }
  }
}