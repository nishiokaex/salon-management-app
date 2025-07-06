export class BookingService {
  constructor(data) {
    this.id = data.id || Date.now().toString();
    this.bookingId = data.bookingId;
    this.serviceId = data.serviceId;
    this.price = data.price; // 実際の料金（割引等適用後）
    this.duration = data.duration; // 実際の施術時間
    this.staffMember = data.staffMember || ''; // 担当スタッフ
    this.notes = data.notes || '';
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  // 予約サービス情報を更新
  updateBookingService(updates) {
    Object.assign(this, updates);
    this.updatedAt = new Date().toISOString();
  }

  // 料金の文字列表現
  getPriceString() {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY'
    }).format(this.price);
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
}