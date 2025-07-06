export class Product {
  constructor(data) {
    this.id = data.id || Date.now().toString();
    this.name = data.name;
    this.category = data.category || '消耗品';
    this.currentStock = data.currentStock || 0;
    this.minStock = data.minStock || 0;
    this.sellingPrice = data.sellingPrice || 0;
    this.costPrice = data.costPrice || 0;
    this.unit = data.unit || '個';
    this.notes = data.notes || '';
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  // 商品情報を更新
  updateProduct(updates) {
    Object.assign(this, updates);
    this.updatedAt = new Date().toISOString();
  }

  // 在庫数を調整
  adjustStock(quantity) {
    this.currentStock += quantity;
    this.updatedAt = new Date().toISOString();
  }

  // 在庫不足かどうかを判定
  isLowStock() {
    return this.currentStock <= this.minStock;
  }

  // 在庫状態の文字列表現
  getStockStatusText() {
    if (this.isLowStock()) {
      return '在庫不足';
    }
    return '在庫有り';
  }

  // 在庫状態の色を取得
  getStockStatusColor() {
    if (this.isLowStock()) {
      return '#EF4444'; // 赤色
    }
    return '#10B981'; // 緑色
  }

  // 利益率を計算
  getProfitMargin() {
    if (this.costPrice === 0) return 0;
    return ((this.sellingPrice - this.costPrice) / this.costPrice) * 100;
  }
}