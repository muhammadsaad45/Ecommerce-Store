import { Suspense } from "react";
import Link from "next/link";
import { connectToDatabase } from "@/lib/mongodb";
import Product from "@/models/Product"; // Adjust path if needed
import FilterSidebar from "@/components/FilterSidebar";
import { getMergedProductCategories } from "@/lib/productCategoryQueries";

export const metadata = {
  title: "Shop All Products | TechStore",
  description: "Browse our complete catalog of premium tech and gadgets.",
};

interface ShopPageProps {
  searchParams: Promise<{
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    inStock?: string;
    sort?: string;
    Brand?: string;
    Processor?: string;
  }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const category = params.category;
  const minPrice = params.minPrice;
  const maxPrice = params.maxPrice;
  const inStock = params.inStock;
  const sort = params.sort || "newest";
  const brand = params.Brand;
  const processor = params.Processor;

  await connectToDatabase();

  const filterData = await Product.aggregate([
    { $match: { isActive: true } },
    {
      $facet: {
        rawCategories: [{ $group: { _id: "$category" } }],
        specs: [
          { $unwind: "$specs" },
          { $match: { "specs.key": { $in: ["Brand", "Processor"] } } },
          { $group: { _id: "$specs.key", values: { $addToSet: "$specs.value" } } },
        ],
      },
    },
  ]);

  const uniqueCategories = (await getMergedProductCategories()).map((category) => category.name);

  const dynamicSpecs: Record<string, string[]> = {};
  filterData[0].specs.forEach((spec: any) => {
    dynamicSpecs[spec._id] = spec.values.filter(Boolean);
  });

  const dbQuery: any = { isActive: true };
  const andConditions: any[] = [];

  if (category && category !== "All") {
    dbQuery.category = { $regex: new RegExp(`^${category.replace(/s$/, "")}s?$`, "i") };
  }

  if (minPrice || maxPrice) {
    dbQuery.price = {};
    if (minPrice) dbQuery.price.$gte = Number(minPrice);
    if (maxPrice) dbQuery.price.$lte = Number(maxPrice);
  }

  if (inStock === "true") {
    dbQuery.stock = { $gt: 0 };
  }

  if (brand) {
    andConditions.push({ specs: { $elemMatch: { key: { $regex: /^Brand$/i }, value: { $regex: new RegExp(`^${brand}$`, "i") } } } });
  }
  if (processor) {
    andConditions.push({ specs: { $elemMatch: { key: { $regex: /^Processor$/i }, value: { $regex: new RegExp(`^${processor}$`, "i") } } } });
  }

  if (andConditions.length > 0) {
    dbQuery.$and = andConditions;
  }

  let sortLogic: any = { createdAt: -1 };
  if (sort === "price_asc") sortLogic = { price: 1 };
  if (sort === "price_desc") sortLogic = { price: -1 };
  
  // Fetch all active products, sorting newest first
  const products = await Product.find(dbQuery)
    .sort(sortLogic)
    .lean();

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="mb-8 border-b border-gray-100 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">All Products</h1>
          <p className="text-gray-500 mt-2">
            {products.length > 0 ? `Showing ${products.length} product${products.length === 1 ? "" : "s"}` : "No products matched your filters"}
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64 shrink-0">
          <Suspense fallback={<div className="h-96 bg-gray-50 animate-pulse rounded-2xl"></div>}>
            <FilterSidebar dbCategories={uniqueCategories} dbSpecs={dynamicSpecs} />
          </Suspense>
        </aside>

        <main className="flex-1">
          {products.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-2">No Products Found</h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">Try clearing some filters or adjusting your price range.</p>
              <Link href="/pages/shop" className="px-6 py-3 rounded-xl bg-blue-600 text-white font-bold">Clear All Filters</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product: any) => (
                <Link key={product._id.toString()} href={`/products/${product.slug || product._id.toString()}`} className="group flex flex-col bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="aspect-square bg-gray-50 rounded-xl p-4 flex items-center justify-center relative mb-4 overflow-hidden">
                    <img src={product.imageUrl} alt={product.name} className="max-h-full max-w-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">{product.category}</span>
                  <h3 className="text-sm font-semibold text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-2 mb-2">{product.name}</h3>
                  <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-50">
                    <span className="text-base font-bold text-gray-900">${product.price.toFixed(2)}</span>
                    <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full group-hover:bg-blue-600 group-hover:text-white transition-all">View details</span>
                  </div>
                </Link>
              ))}
          </div>
          )}
        </main>
      </div>
    </div>
  );
}