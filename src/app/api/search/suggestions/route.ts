import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Product from "@/models/Product";

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    
    // 1. Extract all possible query parameters from the URL
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");
    const category = searchParams.get("category");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const inStock = searchParams.get("inStock");

    // 2. Initialize the base MongoDB query object
    // We strictly only ever return active products
    const dbQuery: any = { isActive: true };

    // 3. Apply Text Search (Deep Search included!)
    if (q) {
      dbQuery.$or = [
        { name: { $regex: q, $options: "i" } },
        { category: { $regex: q, $options: "i" } },
        { "specs.value": { $regex: q, $options: "i" } }, 
      ];
    }

    // 4. Apply Category Filter
    if (category && category !== "All") {
      dbQuery.category = category;
    }

    // 5. Apply Price Filters using MongoDB operators
    if (minPrice || maxPrice) {
      dbQuery.price = {};
      if (minPrice) dbQuery.price.$gte = Number(minPrice); // Greater than or equal to
      if (maxPrice) dbQuery.price.$lte = Number(maxPrice); // Less than or equal to
    }

    // 6. Apply Stock Status Filter
    if (inStock === "true") {
      dbQuery.stock = { $gt: 0 }; // Greater than 0
    }

    // 7. Execute the dynamic query
    const products = await Product.find(dbQuery).lean();

    return NextResponse.json({ products });
  } catch (error) {
    console.error("Search API Error:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}