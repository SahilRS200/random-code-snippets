import { Body, Controller, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { AuthedRequest, Roles } from '../auth/roles.decorator';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './product.schema';
import { ProductsService } from './products.service';

@Controller('products')
@Roles('seller', 'admin')
export class ProductsController {
  constructor(private readonly products: ProductsService) {}

  // Admins can look at any seller's catalogue; sellers see their own
  @Get()
  list(@Req() req: AuthedRequest, @Query('sellerId') sellerId?: string): Promise<Product[]> {
    return this.products.list(sellerId ?? req.user.sellerId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProductDto): Promise<Product> {
    return this.products.update(id, dto);
  }

  @Post(':id/submit')
  submit(@Req() req: AuthedRequest, @Param('id') id: string): Promise<Product> {
    return this.products.submitForReview(id, req.user.sellerId);
  }
}

@Controller('admin/products')
@Roles('admin')
export class AdminProductsController {
  constructor(private readonly products: ProductsService) {}

  @Get('pending')
  pending(): Promise<Product[]> {
    return this.products.listPending();
  }

  @Post(':id/approve')
  approve(@Param('id') id: string): Promise<Product> {
    return this.products.setStatus(id, 'approved');
  }
}
