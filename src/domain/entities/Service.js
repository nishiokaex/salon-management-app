export class Service {
  constructor(data) {
    this.id = data.id || Date.now().toString();
    this.name = data.name;
    this.description = data.description || '';
    this.duration = data.duration; // 施術時間（分）
    this.basePrice = data.basePrice;
    this.category = data.category || 'ヘアケア';
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  // サービス情報を更新
  updateService(updates) {
    Object.assign(this, updates);
    this.updatedAt = new Date().toISOString();
  }

  // サービスの有効/無効を切り替え
  toggleActive() {
    this.isActive = !this.isActive;
    this.updatedAt = new Date().toISOString();
  }

  // 施術時間の文字列表現
  getDurationString() {
    const hours = Math.floor(this.duration / 60);
    const minutes = this.duration % 60;
    if (hours > 0) {
      return minutes > 0 ? `${hours}時間${minutes}分` : `${hours}時間`;
    }
    return `${minutes}分`;
  }

  // 料金の文字列表現
  getPriceString() {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY'
    }).format(this.basePrice);
  }
}