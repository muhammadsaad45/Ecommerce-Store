import Link from "next/link";
import { connectToDatabase } from "@/lib/mongodb";
import Product from "@/models/Product";
import DeleteProductButton from "@/components/DeleteProductButton";

// This tells Next.js to fetch fresh data every time, bypassing the aggressive cache!
export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  // 1. Securely connect to the database on the server
  await connectToDatabase();
  
  // 2. Fetch all products, sorted by the newest first
  const products = await Product.find({}).sort({ createdAt: -1 });

  return (
    <div className="p-10">
      
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Products</h1>
        <Link href="/admin/products/new">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors shadow-sm">
            Add New Product
          </button>
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {products.length === 0 ? (
          <p className="text-gray-500 text-center py-10">
            No products found. Add your first item!
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500">
                  <th className="p-4 font-semibold">Image</th>
                  <th className="p-4 font-semibold">Name</th>
                  <th className="p-4 font-semibold">Price</th>
                  <th className="p-4 font-semibold">Stock</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product._id.toString()} className="hover:bg-gray-50 transition-colors">
                    
                    {/* Image Column */}
                    <td className="p-4">
                      <img 
                        src={product.imageUrl} 
                        alt={product.name} 
                        className="w-12 h-12 object-cover rounded-md border border-gray-200"
                      />
                    </td>
                    
                    {/* Name Column */}
                    <td className="p-4 font-medium text-gray-900">
                      {product.name}
                    </td>
                    
                    {/* Price Column */}
                    <td className="p-4 text-gray-600">
                      ${product.price.toFixed(2)}
                    </td>
                    
                    {/* Stock Column (With a nice visual badge!) */}
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        product.stock > 0 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                      </span>
                    </td>
                    
                    {/* Actions Column */}
                    {/* Actions Column */}
                    <td className="p-4 text-right space-x-4">
                        <Link 
                            href={`/admin/products/${product._id.toString()}/edit`}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                        >
                            Edit
                        </Link>
                        <DeleteProductButton id={product._id.toString()} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
    </div>
  );
}