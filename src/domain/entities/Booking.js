export class Booking {
  constructor(data) {
    this.id = data.id || Date.now().toString();
    this.date = data.date;
    this.time = data.time;
    this.customerName = data.customerName;
    this.customerId = data.customerId;
    this.service = data.service;
    this.price = data.price;
    this.status = data.status || 'scheduled'; // scheduled, completed, cancelled
    this.notes = data.notes || '';
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
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
}