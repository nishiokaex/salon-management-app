export class DashboardUseCase {
  constructor(bookingRepository, customerRepository, productRepository) {
    this.bookingRepository = bookingRepository;
    this.customerRepository = customerRepository;
    this.productRepository = productRepository;
  }

  // ダッシュボード用のサマリーデータを取得（顧客名解決付き）
  async getDashboardSummary() {
    try {
      const [
        todayRevenue,
        todayBookingsRaw,
        totalCustomers,
        lowStockCount
      ] = await Promise.all([
        this.bookingRepository.getTodayRevenue(),
        this.bookingRepository.getTodayBookings(),
        this.customerRepository.getTotalCount(),
        this.productRepository.getLowStockCount()
      ]);

      // 今日の予約に顧客名を解決
      const todayBookings = await Promise.all(
        todayBookingsRaw.map(async (booking) => {
          const enrichedBooking = { ...booking };
          
          if (booking.customerId) {
            const customer = await this.customerRepository.getById(booking.customerId);
            enrichedBooking.customerName = customer ? customer.name : '不明な顧客';
          } else if (booking.customerName) {
            enrichedBooking.customerName = booking.customerName;
          } else {
            enrichedBooking.customerName = '不明な顧客';
          }
          
          return enrichedBooking;
        })
      );

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

  // 今日の予約一覧を取得（顧客名解決付き）
  async getTodayBookings() {
    try {
      const todayBookingsRaw = await this.bookingRepository.getTodayBookings();
      
      // 今日の予約に顧客名を解決
      const todayBookings = await Promise.all(
        todayBookingsRaw.map(async (booking) => {
          const enrichedBooking = { ...booking };
          
          if (booking.customerId) {
            const customer = await this.customerRepository.getById(booking.customerId);
            enrichedBooking.customerName = customer ? customer.name : '不明な顧客';
          } else if (booking.customerName) {
            enrichedBooking.customerName = booking.customerName;
          } else {
            enrichedBooking.customerName = '不明な顧客';
          }
          
          return enrichedBooking;
        })
      );
      
      return todayBookings;
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