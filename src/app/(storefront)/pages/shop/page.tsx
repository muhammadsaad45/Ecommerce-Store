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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {products.map((product: any) => (
              <div 
                key={product._id.toString()} 
                className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col h-full group"
              >
                <div className="h-56 w-full bg-gray-100 relative overflow-hidden border-b border-gray-100">
                  <img 
                    src={product.imageUrl || "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=500"} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                <div className="p-5 flex flex-col grow">
                  <h2 className="font-bold text-lg text-gray-800 mb-1 line-clamp-1">
                    {product.name}
                  </h2>
                  <p className="text-gray-500 text-sm mb-4 line-clamp-2 grow">
                    {product.description}
                  </p>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                    <span className="text-xl font-extrabold text-gray-900">
                      ${product.price.toFixed(2)}
                    </span>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      product.stock > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}>
                      {product.stock > 0 ? "In Stock" : "Out of Stock"}
                    </span>
                  </div>

                  <Link 
                    href={`/products/${product.slug.toString()}`}
                    className="mt-4 w-full bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white text-center font-semibold py-2.5 rounded-lg transition-colors block"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
      )}
    </div>
  );
}