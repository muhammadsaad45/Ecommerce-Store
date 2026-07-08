"use client";

// 1. We import 'use' from react
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// 2. Change the params type to a Promise
export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  
  // 3. Unwrap the params Promise safely using React.use()
  const { id } = use(params);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    imageUrl: "",
  });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        // 4. Use the safely unwrapped 'id' variable here
        const response = await fetch(`/api/products/${id}`);
        if (response.ok) {
          const data = await response.json();
          setFormData({
            name: data.name,
            description: data.description,
            price: data.price.toString(),
            stock: data.stock.toString(),
            imageUrl: data.imageUrl,
          });
        } else {
          alert("Could not find product.");
        }
      } catch (error) {
        console.error("Failed to fetch:", error);
      } finally {
        setFetching(false);
      }
    };

    fetchProduct();
  }, [id]); // Update the dependency array to watch 'id'

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const formattedData = {
        ...formData,
        price: Number(formData.price),
        stock: Number(formData.stock)
      };

      // 5. Use the safely unwrapped 'id' here as well
      const response = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formattedData),
      });

      if (response.ok) {
        router.push("/admin/products");
        router.refresh(); 
      } else {
        alert("Failed to update product.");
      }
    } catch (error) {
      console.error("Network Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="p-10 text-center text-gray-500">Loading product data...</div>;
  }

  return (
    <div className="p-10 max-w-4xl mx-auto">
      <div className="flex items-center mb-8">
        <Link href="/admin/products" className="text-gray-500 hover:text-blue-600 mr-4">
          &larr; Back to Products
        </Link>
        <h1 className="text-3xl font-bold text-gray-800">Edit Product</h1>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>

            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
              <input type="url" name="imageUrl" value={formData.imageUrl} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price ($)</label>
              <input type="number" name="price" min="0" step="0.01" value={formData.price} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Stock</label>
              <input type="number" name="stock" min="0" value={formData.stock} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea name="description" rows={4} value={formData.description} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg shadow-md transition-colors disabled:opacity-50">
              {loading ? "Updating..." : "Update Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}