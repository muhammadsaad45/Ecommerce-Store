import { connectToDatabase } from "@/lib/mongodb";
import Product from "@/models/Product";
import Link from "next/link";
import HeroCarousel from "@/components/HeroCarousel"; 

export const revalidate = 0;

async function getProducts() {
  await connectToDatabase();
  const products = await Product.find({}).sort({ createdAt: -1 }).lean();
  return products;
}

export default async function StoreHomepage() {
  const products = await getProducts();

  return (
    <div>
      <HeroCarousel />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div id="catalog" className="mb-10 text-center md:text-left scroll-mt-20">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">
            Featured Products
          </h1>
          <p className="text-lg text-gray-500">
            Handpicked technology to elevate your daily life.
          </p>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
            <p className="text-gray-500 text-lg">No products found. Go to the Admin Panel to add some!</p>
          </div>
        ) : (
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

                <div className="p-5 flex flex-col flex-grow">
                  <h2 className="font-bold text-lg text-gray-800 mb-1 line-clamp-1">
                    {product.name}
                  </h2>
                  <p className="text-gray-500 text-sm mb-4 line-clamp-2 flex-grow">
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
                    href={`/products/${product._id.toString()}`}
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
    </div>
  );
}