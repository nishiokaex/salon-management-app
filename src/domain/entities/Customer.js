export class Customer {
  constructor(data) {
    this.id = data.id || Date.now().toString();
    this.name = data.name;
    this.phone = data.phone || '';
    this.email = data.email || '';
    this.visitCount = data.visitCount || 0;
    this.lastVisit = data.lastVisit || null;
    this.notes = data.notes || '';
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  // 顧客情報を更新
  updateCustomer(updates) {
    Object.assign(this, updates);
    this.updatedAt = new Date().toISOString();
  }

  // 来店回数を増やす
  incrementVisitCount() {
    this.visitCount += 1;
    this.lastVisit = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }

  // 最終来店日の文字列表現
  getLastVisitString() {
    if (!this.lastVisit) return '来店履歴なし';
    return new Date(this.lastVisit).toLocaleDateString('ja-JP');
  }

  // 検索対象の文字列を結合
  getSearchableString() {
    return `${this.name} ${this.phone} ${this.email}`.toLowerCase();
  }
}