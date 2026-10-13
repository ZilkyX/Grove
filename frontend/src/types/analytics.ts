export interface AnalyticsSummary {
  totalCustomers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
}

export interface DailySalesPoint {
  date: string;
  sales: number;
  revenue: number;
}

export interface TopProduct {
  productId: string;
  name: string;
  image: string;
  quantitySold: number;
  revenue: number;
}

export type OrderPaymentStatus = "pending" | "paid" | "failed";

export interface RecentOrder {
  _id: string;
  user: { name: string; email: string } | null;
  totalAmount: number;
  paymentStatus: OrderPaymentStatus;
  createdAt: string;
}

export interface AnalyticsResponse {
  summary: AnalyticsSummary;
  dailySales: DailySalesPoint[];
  topProducts: TopProduct[];
  recentOrders: RecentOrder[];
  range: { days: number; startDate: string; endDate: string };
}

export const ANALYTICS_RANGE_OPTIONS = [
  { days: 7, label: "7 days" },
  { days: 30, label: "30 days" },
  { days: 365, label: "12 months" },
] as const;

export type AnalyticsRangeDays = (typeof ANALYTICS_RANGE_OPTIONS)[number]["days"];
