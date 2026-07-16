import { connectToDatabase } from "@/lib/mongodb";
import Product from "@/models/Product";
import Link from "next/link";
import { Suspense } from "react";
import FilterSidebar from "@/components/FilterSidebar";

interface SearchPageProps {
  searchParams: Promise<{ 
    q?: string;
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    inStock?: string;
    sort?: string;
    Brand?: string;
    Processor?: string;
  }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.q || "";
  const category = params.category;
  const minPrice = params.minPrice;
  const maxPrice = params.maxPrice;
  const inStock = params.inStock;
  const sort = params.sort || "newest";
  const brand = params.Brand;
  const processor = params.Processor;

  await connectToDatabase();

  // 1. EXTRACT DYNAMIC FILTERS DIRECTLY FROM EXISTING PRODUCTS
  // This pipeline scans all active products and extracts unique categories and specific spec values!
  const filterData = await Product.aggregate([
    { $match: { isActive: true } },
    {
      $facet: {
        rawCategories: [{ $group: { _id: "$category" } }],
        specs: [
          { $unwind: "$specs" },
          // Only extract values for these specific keys to keep the sidebar clean
          { $match: { "specs.key": { $in: ["Brand", "Processor"] } } }, 
          { $group: { _id: "$specs.key", values: { $addToSet: "$specs.value" } } }
        ]
      }
    }
  ]);

  // Clean up categories
  const uniqueCategories = Array.from(
    new Set(filterData[0].rawCategories.map((c: any) => c._id?.trim().toLowerCase()))
  ).filter(Boolean).map((c: any) => c.charAt(0).toUpperCase() + c.slice(1)); 

  // Format dynamic specs { Brand: ["Apple", "Samsung"], Processor: ["Snapdragon", "A15"] }
  const dynamicSpecs: Record<string, string[]> = {};
  filterData[0].specs.forEach((spec: any) => {
    dynamicSpecs[spec._id] = spec.values.filter(Boolean);
  });

  // 2. BUILD THE SEARCH QUERY
  const dbQuery: any = { isActive: true };
  const andConditions: any[] = []; // Used for complex spec matching

  if (query) {
    dbQuery.$or = [
      { name: { $regex: query, $options: "i" } },
      { category: { $regex: query, $options: "i" } },
      { "specs.value": { $regex: query, $options: "i" } },
    ];
  }

  // Use case-insensitive Regex to fix the "s" at the end bug!
  if (category && category !== "All") {
    dbQuery.category = { $regex: new RegExp(`^${category.replace(/s$/, '')}s?$`, "i") };
  }

  if (minPrice || maxPrice) {
    dbQuery.price = {};
    if (minPrice) dbQuery.price.$gte = Number(minPrice);
    if (maxPrice) dbQuery.price.$lte = Number(maxPrice);
  }

  if (inStock === "true") {
    dbQuery.stock = { $gt: 0 };
  }

  // Push dynamic specs into an $and array so they must ALL match
  if (brand) {
    andConditions.push({ specs: { $elemMatch: { key: { $regex: /^Brand$/i }, value: { $regex: new RegExp(`^${brand}$`, "i") } } } });
  }
  if (processor) {
    andConditions.push({ specs: { $elemMatch: { key: { $regex: /^Processor$/i }, value: { $regex: new RegExp(`^${processor}$`, "i") } } } });
  }

  if (andConditions.length > 0) {
    dbQuery.$and = andConditions;
  }

  // 3. DETERMINE SORTING LOGIC
  let sortLogic: any = { createdAt: -1 }; // Default: Newest Added
  if (sort === "price_asc") sortLogic = { price: 1 }; // Low to High
  if (sort === "price_desc") sortLogic = { price: -1 }; // High to Low

  // 4. FETCH RESULTS
  const products = await Product.find(dbQuery).sort(sortLogic).lean();

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="mb-8 border-b border-gray-100 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Search Results</h1>
          <p className="text-gray-500 mt-2">
            {products.length > 0 ? `Found ${products.length} product${products.length === 1 ? "" : "s"}${query ? ` for "${query}"` : ""}` : `We couldn't find any results${query ? ` for "${query}"` : ""}`}
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64 shrink-0">
          <Suspense fallback={<div className="h-96 bg-gray-50 animate-pulse rounded-2xl"></div>}>
            {/* Pass the dynamic data extracted from the DB straight to the sidebar */}
            <FilterSidebar dbCategories={uniqueCategories} dbSpecs={dynamicSpecs} />
          </Suspense>
        </aside>

        <main className="flex-1">
          {products.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-2">No Products Found</h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">Try clearing some filters or searching for something else.</p>
              <Link href="/search" className="px-6 py-3 rounded-xl bg-blue-600 text-white font-bold">Clear All Filters</Link>
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