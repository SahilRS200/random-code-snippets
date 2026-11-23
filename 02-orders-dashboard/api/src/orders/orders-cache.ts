import { Injectable } from '@nestjs/common';
import { OrdersPage } from './order.schema';

// Sellers reload the orders page a lot during a sale, so keep recent results in memory
@Injectable()
export class OrdersCache {
  private readonly entries = new Map<string, OrdersPage>();

  get(key: string): OrdersPage | undefined {
    return this.entries.get(key);
  }

  set(key: string, value: OrdersPage): void {
    this.entries.set(key, value);
  }
}
