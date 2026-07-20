import { connectToDatabase } from "@/lib/mongodb";
import ProductCategory from "@/models/ProductCategory";
import { DEFAULT_PRODUCT_CATEGORIES, ProductCategoryDefinition } from "@/lib/productCatalog";

export async function getMergedProductCategories(): Promise<ProductCategoryDefinition[]> {
  await connectToDatabase();

  const customCategories = await ProductCategory.find({}).sort({ name: 1 }).lean();

  return [
    ...DEFAULT_PRODUCT_CATEGORIES,
    ...customCategories.map((category) => ({
      name: category.name,
      slug: category.slug,
      description: category.description,
      specGroups: category.specGroups,
      source: "custom" as const,
    })),
  ];
}
