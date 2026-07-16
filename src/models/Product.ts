import mongoose, { Schema, model, models } from "mongoose";

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
  category: string;
  stock: number;
  isActive: boolean;
  specs: ISpecification[]; // <-- NEW: Dynamic spec array
}

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a product name"],
      trim: true,
    },
    // NEW: Pretty URL identifier
    slug: {
      type: String,
      required: [true, "Please provide a URL slug"],
      unique: true,
      trim: true,
    },
    // NEW: For the Categories page
    category: {
      type: String,
      required: [true, "Please provide a category"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Please provide a product description"],
    },
    price: {
      type: Number,
      required: [true, "Please provide a price"],
      min: [0, "Price cannot be negative"],
    },
    stock: {
      type: Number,
      required: [true, "Please specify the stock amount"],
      min: [0, "Stock cannot be negative"],
      default: 0,
    },
    imageUrl: {
      type: String,
      required: [true, "Please provide an image URL for the product"],
    },
    // NEW: For hiding products from the storefront
    isActive: {
      type: Boolean,
      default: true,
    }
  },
  {
    // This automatically creates 'createdAt' and 'updatedAt' timestamps for you!
    timestamps: true, 
  }
);

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    price: { type: Number, required: true },
    description: { type: String, required: true },
    imageUrl: { type: String, required: true },
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

// 1. Force Mongoose to delete the old cached version of the model
delete mongoose.models.Product;

// 2. Recompile the fresh, updated schema
const Product = models.Product || model("Product", productSchema);

if (process.env.NODE_ENV === "development") {
  delete mongoose.models.Product;
}
export default mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);