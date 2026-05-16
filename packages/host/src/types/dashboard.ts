export interface DashboardMetrics {
  attendanceRate: number;
  cancellationRate: number;
  completedOrdersCount: number;
  courierEfficiency: number;
  hourlyOrders: HourlyOrder[];
  onTimeDeliveryRate: number;
  rejectionRate: number;
}
export interface HourlyOrder {
  hour: string;
  value: number;
}
