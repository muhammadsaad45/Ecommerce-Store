import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Product from "@/models/Product";

export async function POST(request: Request) {
  try {
    // 1. Open the database connection
    await connectToDatabase();
    
    // 2. Grab the data sent from your frontend form
    const body = await request.json();
    
    // 3. Tell Mongoose to create a new Product using our schema
    const newProduct = await Product.create(body);
    
    // 4. Return a success message back to the frontend
    return NextResponse.json({ success: true, product: newProduct }, { status: 201 });
    
  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}

