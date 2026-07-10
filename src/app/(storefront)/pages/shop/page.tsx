import Link from "next/link";
import { connectToDatabase } from "@/lib/mongodb";
import Product from "@/models/Product"; // Adjust path if needed

export const metadata = {
  title: "Shop All Products | TechStore",
  description: "Browse our complete catalog of premium tech and gadgets.",
};

export default async function ShopPage() {
  await connectToDatabase();
  
  // Fetch all active products, sorting newest first
  const products = await Product.find({ isActive: true }) // Or however you track active status
    .sort({ createdAt: -1 })
    .lean();

  return (
    <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 mt-4">
      <div className="flex items-center justify-between mb-10 border-b pb-6">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
          All Products
        </h1>
        <span className="text-sm font-medium text-gray-500">
          {products.length} {products.length === 1 ? 'Item' : 'Items'}
        </span>
      </div>

      {products.length === 0 ? (
        // The Empty State
        <div className="text-center py-24 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900">No products available yet</h3>
          <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
            We are currently restocking our inventory. Check back soon for the latest premium gadgets!
          </p>
        </div>
      ) : (
        // The Product Grid
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product: any) => (
            <Link 
              key={product._id.toString()} 
              href={`/products/${product.slug || product._id.toString()}`}
              className="group flex flex-col bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300"
            >
              <div className="aspect-square bg-gray-100 overflow-hidden relative">
                {product.imageUrl ? (
                  <img 
                    src={product.imageUrl} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No Image
                  </div>
                )}
              </div>
              <div className="p-5 flex flex-col flex-grow">
                <p className="text-xs text-blue-600 font-bold tracking-wider uppercase mb-1">
                  {product.category || "Uncategorized"}
                </p>
                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                  {product.name}
                </h3>
                <div className="mt-auto pt-4 flex items-center justify-between border-t border-gray-100">
                  <span className="text-xl font-extrabold text-gray-900">
                    ${product.price.toFixed(2)}
                  </span>
                  <span className="text-sm font-medium text-blue-600 group-hover:translate-x-1 transition-transform">
                    View &rarr;
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}