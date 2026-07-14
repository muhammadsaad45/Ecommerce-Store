import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";

// Helper function to generate a random 6-character alphanumeric code
function generateOrderNumber(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    
    const body = await req.json();
    const { customer, items, subtotal, shippingCost, total } = body;

    // Generate a unique order number
    let orderNumber = generateOrderNumber();
    let isUnique = false;

    // Safety loop to prevent collision duplicates
    while (!isUnique) {
      const existing = await Order.findOne({ orderNumber });
      if (!existing) {
        isUnique = true;
      } else {
        orderNumber = generateOrderNumber();
      }
    }

    // 1. Create the order with our human-friendly orderNumber
    const newOrder = await Order.create({
      orderNumber, // <-- SAVE NEW CODE HERE
      customer,
      items,
      subtotal,
      shippingCost,
      total,
      status: "Pending",
    });

    await Promise.all(
      items.map(async (item: any) => {
        await Product.findByIdAndUpdate(
          item.product,
          { $inc: { stock: -item.quantity } }
        );
      })
    );

    // CRITICAL: We return the orderNumber to the frontend instead of the _id!
    return NextResponse.json({ success: true, orderNumber }, { status: 201 });
    
  } catch (error) {
    console.error("Order processing failed:", error);
    return NextResponse.json({ error: "Failed to process order securely" }, { status: 500 });
  }
}