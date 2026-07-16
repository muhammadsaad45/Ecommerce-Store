import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Product from "@/models/Product";

type ProductImagePayload = {
  imageUrl?: unknown;
  images?: unknown;
  [key: string]: unknown;
};

function normalizeProductImages(body: ProductImagePayload) {
  const images = Array.isArray(body.images)
    ? body.images.filter((image): image is string => typeof image === "string" && image.trim().length > 0)
    : [];
  const primaryImage = typeof body.imageUrl === "string" && body.imageUrl.trim().length > 0
    ? body.imageUrl.trim()
    : images[0] || "";

  return {
    ...body,
    imageUrl: primaryImage,
    images: images.length > 0 ? images : primaryImage ? [primaryImage] : [],
  };
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase();
    
    // 1. Await the params Promise to extract the ID safely
    const { id } = await params;
    
    // 2. Use the extracted ID
    const product = await Product.findById(id);
    
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    
    return NextResponse.json(product);
  } catch {
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase();
    const body = (await request.json()) as ProductImagePayload;
    const normalizedBody = normalizeProductImages(body);
    
    // 1. Await the params Promise here too
    const { id } = await params;
    
    const updatedProduct = await Product.findByIdAndUpdate(id, normalizedBody, { new: true });
    
    return NextResponse.json({ success: true, product: updatedProduct });
  } catch {
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

// 3. DELETE: Remove the product entirely
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase();
    
    // Safely unwrap the ID just like we did for GET and PUT
    const { id } = await params;
    
    // Find the product and delete it in one move
    const deletedProduct = await Product.findByIdAndDelete(id);
    
    if (!deletedProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}