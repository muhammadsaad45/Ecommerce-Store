import mongoose, { Schema, model, models } from "mongoose";

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a product name"],
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
  },
  {
    // This automatically creates 'createdAt' and 'updatedAt' timestamps for you!
    timestamps: true, 
  }
);

// Prevent Next.js from crashing by trying to overwrite the model
const Product = models.Product || model("Product", productSchema);

export default Product;