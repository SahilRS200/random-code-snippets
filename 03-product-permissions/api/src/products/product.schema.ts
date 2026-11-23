import { Schema } from 'mongoose';

export type ProductStatus = 'draft' | 'pending_review' | 'approved' | 'rejected';

export interface Product {
  _id: string;
  sellerId: string;
  name: string;
  description: string;
  pricePaise: number;
  status: ProductStatus;
  updatedAt: Date;
}

export const ProductSchema = new Schema<Product>(
  {
    sellerId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    description: { type: String, default: '' },
    pricePaise: { type: Number, required: true },
    status: { type: String, required: true, default: 'draft' },
  },
  { timestamps: true },
);
