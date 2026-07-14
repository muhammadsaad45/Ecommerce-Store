import mongoose, { Schema, Document } from "mongoose";

export interface IOrder extends Document {
  orderNumber: string;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    address: string;
    city: string;
    zip: string;
  };
  items: {
    product: mongoose.Types.ObjectId;
    name: string;
    price: number;
    quantity: number;
  }[];
  subtotal: number;
  shippingCost: number;
  total: number;
  status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
  createdAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    // 1. orderNumber sits directly at the root level of the schema
    orderNumber: { type: String, required: true, unique: true, uppercase: true },
    
    // 2. customer object is totally separate
    customer: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      email: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      zip: { type: String, required: true },
    },
    items: [
      {
        product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
      },
    ],
    subtotal: { type: Number, required: true },
    shippingCost: { type: Number, required: true },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

// Wipe the cached model in development so Mongoose catches this structural change!
if (process.env.NODE_ENV === "development") {
  delete mongoose.models.Order;
}

export default mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);