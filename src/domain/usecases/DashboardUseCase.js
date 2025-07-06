export class DashboardUseCase {
  constructor(bookingRepository, customerRepository, productRepository) {
    this.bookingRepository = bookingRepository;
    this.customerRepository = customerRepository;
    this.productRepository = productRepository;
  }

  // ダッシュボード用のサマリーデータを取得
  async getDashboardSummary() {
    try {
      const [
        todayRevenue,
        todayBookings,
        totalCustomers,
        lowStockCount
      ] = await Promise.all([
        this.bookingRepository.getTodayRevenue(),
        this.bookingRepository.getTodayBookings(),
        this.customerRepository.getTotalCount(),
        this.productRepository.getLowStockCount()
      ]);

      return {
        todayRevenue,
        todayBookingCount: todayBookings.length,
        todayBookings,
        totalCustomers,
        lowStockCount
      };
    } catch (error) {
      throw new Error(`Failed to get dashboard summary: ${error.message}`);
    }
  }

  // 今日の予約一覧を取得
  async getTodayBookings() {
    try {
      return await this.bookingRepository.getTodayBookings();
    } catch (error) {
      throw new Error(`Failed to get today's bookings: ${error.message}`);
    }
  }

  // 在庫アラート商品を取得
  async getLowStockProducts() {
    try {
      return await this.productRepository.getLowStockProducts();
    } catch (error) {
      throw new Error(`Failed to get low stock products: ${error.message}`);
    }
  }
}