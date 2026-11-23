import { Controller, Get, Header, Query, Req, UseGuards } from '@nestjs/common';
import { SellerAuthGuard, SellerRequest } from '../auth/seller-auth.guard';
import { ListOrdersQuery, OrdersPage } from './order.schema';
import { OrdersService } from './orders.service';

@Controller('seller/orders')
@UseGuards(SellerAuthGuard)
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Get()
  list(@Req() req: SellerRequest, @Query() query: ListOrdersQuery): Promise<OrdersPage> {
    return this.orders.list(req.seller.id, query);
  }

  @Get('export')
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', 'attachment; filename="orders.csv"')
  export(@Req() req: SellerRequest): Promise<string> {
    return this.orders.exportCsv(req.seller.id);
  }
}
