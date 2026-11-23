import { Schema } from 'mongoose';

export type OrderStatus = 'placed' | 'packed' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
  productId: string;
  quantity: number;
  // Filled in for display
  name?: string;
  pricePaise?: number;
}

export interface Order {
  _id: string;
  orderNumber: string;
  sellerId: string;
  customerId: string;
  customerName: string;
  status: OrderStatus;
  items: OrderItem[];
  totalPaise: number;
  createdAt: Date;
}

export interface Product {
  _id: string;
  name: string;
  pricePaise: number;
}

export interface ListOrdersQuery {
  page?: string;
  status?: OrderStatus;
  search?: string;
  from?: string;
  to?: string;
}

export interface OrdersPage {
  page: number;
  total: number;
  rows: Order[];
}

export const OrderSchema = new Schema<Order>({
  orderNumber: { type: String, required: true },
  sellerId: { type: String, required: true },
  customerId: { type: String, required: true },
  customerName: { type: String },
  status: { type: String, required: true },
  items: [{ productId: String, quantity: Number }],
  totalPaise: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ status: 1 });
