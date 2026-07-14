import { connectToDatabase } from "@/lib/mongodb";
import Product from "@/models/Product";
import Link from "next/link";

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q: query } = await searchParams;

  await connectToDatabase();

  let products: any[] = [];
  
  if (query) {
    // Perform a case-insensitive regex search on both the 'name' and 'category' fields
    products = await Product.find({
      isActive: true,
      $or: [
        { name: { $regex: query, $options: "i" } },
        { category: { $regex: query, $options: "i" } },
      ],
    }).lean();
  }

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="mb-8 border-b border-gray-100 pb-6">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Search Results
        </h1>
        <p className="text-gray-500 mt-2">
          {products.length > 0
            ? `Found ${products.length} product${products.length === 1 ? "" : "s"} for "${query}"`
            : `We couldn't find any results for "${query || ""}"`}
        </p>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <svg
            className="mx-auto h-12 w-12 text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="text-lg font-bold text-gray-900 mb-2">No Products Found</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Try checking your spelling, or searching for broader categories like "phones", "laptops", or "accessories".
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-blue-600 text-white font-bold shadow-md hover:bg-blue-700 transition-colors text-sm"
          >
            Back to Shop
          </Link>
        </div>
      ) : (
        // The standard product card grid
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {products.map((product: any) => (
            <Link
              key={product._id.toString()}
              href={`/products/${product.slug || product._id.toString()}`}
              className="group flex flex-col bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-all duration-300"
            >
              {/* Product Image Wrapper */}
              <div className="aspect-square bg-gray-50 rounded-xl p-4 flex items-center justify-center relative mb-4 overflow-hidden">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="max-h-full max-w-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Category & Title */}
              <span className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">
                {product.category}
              </span>
              <h3 className="text-sm font-semibold text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-2 mb-2">
                {product.name}
              </h3>

              {/* Price & Action */}
              <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-50">
                <span className="text-base font-bold text-gray-900">
                  ${product.price.toFixed(2)}
                </span>
                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full group-hover:bg-blue-600 group-hover:text-white transition-all">
                  View details
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}