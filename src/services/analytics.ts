import { apiClient } from './api';

export interface DashboardSummary {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  averageOrderValue: number;
  revenueGrowth: number;
  orderGrowth: number;
  userGrowth: number;
}

export interface RevenueData {
  period: string;
  revenue: number;
  orders: number;
}

export interface OrderStatusData {
  name: string;
  value: number;
  color: string;
}

export interface UserGrowthData {
  period: string;
  buyers: number;
  sellers: number;
}

export interface TopListing {
  name: string;
  sales: number;
  revenue: number;
}

export interface RecentActivity {
  id: number;
  type: string;
  message: string;
  time: string;
}

export interface DashboardData {
  summary: DashboardSummary;
  revenueData: RevenueData[];
  orderStatusData: OrderStatusData[];
  userGrowthData: UserGrowthData[];
  topListings: TopListing[];
  recentActivities: RecentActivity[];
}

export const analyticsService = {
  async getDashboard(
    period: 'daily' | 'weekly' | 'monthly' = 'monthly',
    fromDate?: string,
    toDate?: string
  ): Promise<DashboardData> {
    const params = new URLSearchParams();
    params.append('period', period);
    if (fromDate) params.append('fromDate', fromDate);
    if (toDate) params.append('toDate', toDate);

    return await apiClient.get<DashboardData>(`/analytics/dashboard?${params.toString()}`);
  },
};
