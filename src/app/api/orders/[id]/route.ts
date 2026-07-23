import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Order from "@/models/Order";

export async function PUT(req: Request, { params }: { params: Promise<{ id?: string, orderId?: string }> }) {
  try {
    const resolvedParams = await params;
    
    // THE FIX: Dynamically grab the ID whether the folder is named [id] or [orderId]
    const id = resolvedParams.id || resolvedParams.orderId;

    if (!id) {
      return NextResponse.json({ error: "Missing order ID in URL" }, { status: 400 });
    }

    const { status, trackingNumber } = await req.json();

    await connectToDatabase();

    const updateData: any = { status };
    if (trackingNumber !== undefined) {
      updateData.trackingNumber = trackingNumber;
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { $set: updateData },
      { returnDocument: "after" } 
    );

    if (!updatedOrder) {
      console.error(`Order with ID ${id} not found in database.`);
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error("Failed to update order:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}