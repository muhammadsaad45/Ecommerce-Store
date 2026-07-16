import { Schema, model, models, type Document } from "mongoose";

export interface ISpecification {
  key: string;
  value: string;
  group: string; // e.g., "Display", "Performance", "Camera"
}

export interface IProduct extends Document {
  name: string;
  slug: string;
  price: number;
  description: string;
  imageUrl: string;
  images: string[];
  category: string;
  stock: number;
  isActive: boolean;
  specs: ISpecification[]; // <-- NEW: Dynamic spec array
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    price: { type: Number, required: true },
    description: { type: String, required: true },
    imageUrl: { type: String, required: true },
    images: { type: [String], default: [] },
    category: { type: String, required: true },
    stock: { type: Number, required: true, default: 0 },
    isActive: { type: Boolean, default: true },
    
    // The matrix configuration
    specs: [
      {
        key: { type: String, required: true },
        value: { type: String, required: true },
        group: { type: String, required: true }, // Used to categorize chunks
      },
    ],
  },
  { timestamps: true }
);

const Product = models.Product || model<IProduct>("Product", ProductSchema);

export default Product;