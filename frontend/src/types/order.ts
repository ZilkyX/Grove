export interface OrderLineItem {
  product: { _id: string; name: string; image: string } | null;
  quantity: number;
  price: number;
}

export type OrderPaymentStatus = "pending" | "paid" | "failed";

export interface Order {
  _id: string;
  products: OrderLineItem[];
  totalAmount: number;
  paymentStatus: OrderPaymentStatus;
  createdAt: string;
}

export interface PaginatedOrders {
  orders: Order[];
  page: number;
  totalPages: number;
  totalOrders: number;
}
