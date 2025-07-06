export class Customer {
  constructor(data) {
    this.id = data.id || Date.now().toString();
    this.name = data.name;
    this.phone = data.phone || '';
    this.email = data.email || '';
    this.notes = data.notes || '';
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
    
    // 予約データへの参照（リアルタイム計算用）
    this._bookings = data._bookings || [];
  }

  // 顧客情報を更新
  updateCustomer(updates) {
    Object.assign(this, updates);
    this.updatedAt = new Date().toISOString();
  }

  // 検索対象の文字列を結合
  getSearchableString() {
    return `${this.name} ${this.phone} ${this.email}`.toLowerCase();
  }

  // 予約データを設定（リアルタイム計算用）
  setBookings(bookings) {
    this._bookings = bookings || [];
  }

  // 来店回数をリアルタイム計算
  get visitCount() {
    if (!this._bookings) return 0;
    return this._bookings.filter(booking => booking.status === 'completed').length;
  }

  // 最終来店日をリアルタイム計算
  get lastVisit() {
    if (!this._bookings) return null;
    
    const completedBookings = this._bookings.filter(booking => booking.status === 'completed');
    if (completedBookings.length === 0) return null;
    
    const dates = completedBookings
      .map(booking => new Date(booking.date))
      .sort((a, b) => b - a);
    
    return dates[0].toISOString();
  }

  // 最終来店日の文字列表現
  getLastVisitString() {
    if (!this.lastVisit) return '来店履歴なし';
    return new Date(this.lastVisit).toLocaleDateString('ja-JP');
  }
}