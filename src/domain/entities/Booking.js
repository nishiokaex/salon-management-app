export class Booking {
  constructor(data) {
    this.id = data.id || Date.now().toString();
    this.customerId = data.customerId;
    this.date = data.date;
    this.time = data.time;
    this.status = data.status || 'scheduled'; // scheduled, completed, cancelled
    this.totalPrice = data.totalPrice || 0;
    this.totalDuration = data.totalDuration || 0;
    this.notes = data.notes || '';
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
    
    // 後方互換性のためのフィールド
    if (data.customerName) this.customerName = data.customerName;
    if (data.service) this.service = data.service;
    if (data.price !== undefined) this.price = data.price;
  }

  // 予約状態を更新
  updateStatus(newStatus) {
    this.status = newStatus;
    this.updatedAt = new Date().toISOString();
  }

  // 予約情報を更新
  updateBooking(updates) {
    Object.assign(this, updates);
    this.updatedAt = new Date().toISOString();
  }

  // 予約日時の文字列表現
  getDateTimeString() {
    return `${this.date} ${this.time}`;
  }

  // 予約状態の日本語表示
  getStatusText() {
    const statusMap = {
      scheduled: '予約済み',
      completed: '完了',
      cancelled: 'キャンセル'
    };
    return statusMap[this.status] || this.status;
  }

  // 合計料金の文字列表現
  getTotalPriceString() {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY'
    }).format(this.totalPrice);
  }

  // 合計時間の文字列表現
  getTotalDurationString() {
    const hours = Math.floor(this.totalDuration / 60);
    const minutes = this.totalDuration % 60;
    if (hours > 0) {
      return minutes > 0 ? `${hours}時間${minutes}分` : `${hours}時間`;
    }
    return `${minutes}分`;
  }
}