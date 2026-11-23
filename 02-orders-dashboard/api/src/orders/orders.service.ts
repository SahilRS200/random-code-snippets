import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { ListOrdersQuery, Order, OrdersPage, Product } from './order.schema';
import { OrdersCache } from './orders-cache';

const PAGE_SIZE = 20;

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel('Order') private readonly orderModel: Model<Order>,
    @InjectModel('Product') private readonly productModel: Model<Product>,
    private readonly cache: OrdersCache,
  ) {}

  async list(sellerId: string, query: ListOrdersQuery): Promise<OrdersPage> {
    const page = Number(query.page ?? 1);
    const from = query.from ?? '2020-01-01';
    const to = query.to ?? new Date().toISOString();

    const cacheKey = `${sellerId}:${page}:${query.status ?? ''}:${query.search ?? ''}:${from}:${to}`;
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const filter: FilterQuery<Order> = {
      sellerId,
      createdAt: { $gte: new Date(from), $lte: new Date(to) },
    };
    if (query.status) {
      filter.status = query.status;
    }
    if (query.search) {
      const pattern = new RegExp(query.search, 'i');
      filter.$or = [{ customerName: pattern }, { orderNumber: pattern }];
    }

    const all = await this.orderModel.find(filter).sort({ createdAt: -1 }).lean<Order[]>();
    const rows = all.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    for (const order of rows) {
      for (const item of order.items) {
        const product = await this.productModel.findById(item.productId).lean<Product>();
        item.name = product?.name ?? 'Deleted product';
        item.pricePaise = product?.pricePaise ?? 0;
      }
    }

    const result: OrdersPage = { page, total: all.length, rows };
    this.cache.set(cacheKey, result);
    return result;
  }

  async exportCsv(sellerId: string): Promise<string> {
    const orders = await this.orderModel.find({ sellerId }).sort({ createdAt: -1 }).lean<Order[]>();

    let csv = 'order,date,customer,status,total\n';
    for (const order of orders) {
      // Deep copy so dates come out as ISO strings
      const row = JSON.parse(JSON.stringify(order)) as Record<string, string | number>;
      csv += [
        row.orderNumber,
        row.createdAt,
        `"${row.customerName}"`,
        row.status,
        (Number(row.totalPaise) / 100).toFixed(2),
      ].join(',') + '\n';
    }
    return csv;
  }
}
