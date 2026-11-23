import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product, ProductStatus } from './product.schema';

@Injectable()
export class ProductsService {
  constructor(@InjectModel('Product') private readonly productModel: Model<Product>) {}

  list(sellerId: string): Promise<Product[]> {
    return this.productModel.find({ sellerId }).sort({ updatedAt: -1 }).lean<Product[]>().exec();
  }

  listPending(): Promise<Product[]> {
    return this.productModel.find({ status: 'pending_review' }).lean<Product[]>().exec();
  }

  async update(id: string, dto: UpdateProductDto): Promise<Product> {
    const product = await this.productModel
      .findByIdAndUpdate(id, { $set: dto }, { new: true })
      .lean<Product>()
      .exec();
    if (!product) {
      throw new NotFoundException();
    }
    return product;
  }

  async submitForReview(id: string, sellerId: string): Promise<Product> {
    const product = await this.productModel
      .findOneAndUpdate(
        { _id: id, sellerId, status: { $in: ['draft', 'rejected'] } },
        { $set: { status: 'pending_review' } },
        { new: true },
      )
      .lean<Product>()
      .exec();
    if (!product) {
      throw new NotFoundException();
    }
    return product;
  }

  async setStatus(id: string, status: ProductStatus): Promise<Product> {
    const product = await this.productModel
      .findByIdAndUpdate(id, { $set: { status } }, { new: true })
      .lean<Product>()
      .exec();
    if (!product) {
      throw new NotFoundException();
    }
    return product;
  }
}
