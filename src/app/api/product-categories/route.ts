import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import ProductCategory from "@/models/ProductCategory";
import {
  DEFAULT_PRODUCT_CATEGORIES,
  ProductCategoryDefinition,
  slugifyCategoryName,
} from "@/lib/productCatalog";

function normalizeCategorySchema(category: ProductCategoryDefinition) {
  return {
    name: category.name.trim(),
    slug: slugifyCategoryName(category.slug || category.name),
    description: category.description?.trim() || "",
    specGroups: category.specGroups
      .map((group) => ({
        group: group.group.trim(),
        keys: Array.from(new Set(group.keys.map((key) => key.trim()).filter(Boolean))),
      }))
      .filter((group) => group.group && group.keys.length > 0),
    source: category.source || "custom",
  };
}

export async function GET() {
  try {
    await connectToDatabase();

    const customCategories = await ProductCategory.find({}).sort({ name: 1 }).lean();

    const categories = [
      ...DEFAULT_PRODUCT_CATEGORIES,
      ...customCategories.map((category) => ({
        name: category.name,
        slug: category.slug,
        description: category.description,
        specGroups: category.specGroups,
        source: "custom" as const,
      })),
    ];

    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Failed to load product categories:", error);
    return NextResponse.json({ error: "Failed to load product categories" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();

    const body = (await request.json()) as ProductCategoryDefinition;
    const normalized = normalizeCategorySchema(body);

    if (!normalized.name || !normalized.slug || normalized.specGroups.length === 0) {
      return NextResponse.json({ error: "Category name, slug, and at least one spec group are required" }, { status: 400 });
    }

    const defaultExists = DEFAULT_PRODUCT_CATEGORIES.some((category) => category.slug === normalized.slug);
    const customExists = await ProductCategory.findOne({ slug: normalized.slug }).lean();

    if (defaultExists || customExists) {
      return NextResponse.json({ error: "A category with that slug already exists" }, { status: 409 });
    }

    const createdCategory = await ProductCategory.create({
      name: normalized.name,
      slug: normalized.slug,
      description: normalized.description,
      specGroups: normalized.specGroups,
    });

    return NextResponse.json({ success: true, category: createdCategory }, { status: 201 });
  } catch (error) {
    console.error("Failed to create product category:", error);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}