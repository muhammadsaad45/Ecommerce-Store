import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Product from "@/models/Product";
import { DEFAULT_PRODUCT_CATEGORIES, slugifyCategoryName } from "@/lib/productCatalog";

type ProductImagePayload = {
  imageUrl?: unknown;
  images?: unknown;
  category?: unknown;
  categorySlug?: unknown;
  [key: string]: unknown;
};

function normalizeCategoryFields(body: ProductImagePayload) {
  const category = typeof body.category === "string" ? body.category.trim() : "";
  const categorySlug = typeof body.categorySlug === "string" && body.categorySlug.trim().length > 0
    ? body.categorySlug.trim()
    : slugifyCategoryName(category);
  const matchedCategory = DEFAULT_PRODUCT_CATEGORIES.find((item) => item.slug === categorySlug || item.name === category) || null;

  return {
    ...body,
    category: matchedCategory?.name || category,
    categorySlug: matchedCategory?.slug || categorySlug,
  };
}

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

function normalizeProductPayload(body: ProductImagePayload) {
  return normalizeCategoryFields(normalizeProductImages(body));
}

export async function POST(request: Request) {
  try {
    // 1. Open the database connection
    await connectToDatabase();
    
    // 2. Grab the data sent from your frontend form
    const body = (await request.json()) as ProductImagePayload;
    const normalizedBody = normalizeProductPayload(body);
    
    // 3. Tell Mongoose to create a new Product using our schema
    const newProduct = await Product.create(normalizedBody);
    
    // 4. Return a success message back to the frontend
    return NextResponse.json({ success: true, product: newProduct }, { status: 201 });
    
  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}

