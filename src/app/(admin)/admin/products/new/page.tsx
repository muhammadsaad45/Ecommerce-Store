"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CldUploadWidget } from "next-cloudinary";

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    imageUrl: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent submission if they haven't uploaded an image yet!
    if (!formData.imageUrl) {
      alert("Please upload a product image first.");
      return;
    }

    setLoading(true);
    
    try {
      const formattedData = {
        ...formData,
        price: Number(formData.price),
        stock: Number(formData.stock)
      };

      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formattedData),
      });

      if (response.ok) {
        router.push("/admin/products");
        router.refresh(); 
      } else {
        alert("Failed to save product.");
      }
    } catch (error) {
      console.error("Network Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-10 max-w-4xl mx-auto">
      <div className="flex items-center mb-8">
        <Link href="/admin/products" className="text-gray-500 hover:text-blue-600 mr-4">
          &larr; Back to Products
        </Link>
        <h1 className="text-3xl font-bold text-gray-800">Add New Product</h1>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left Column: Text Inputs */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price ($)</label>
                  <input type="number" name="price" min="0" step="0.01" value={formData.price} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Stock</label>
                  <input type="number" name="stock" min="0" value={formData.stock} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
              </div>
            </div>

            {/* Right Column: Image Upload Area */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Product Image</label>
              <div className="h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center bg-gray-50 overflow-hidden relative">
                
                {/* 2. Show the image if it exists, otherwise show the upload button */}
                {formData.imageUrl ? (
                  <div className="w-full h-full relative">
                    <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    <button 
                      type="button" 
                      onClick={() => setFormData({ ...formData, imageUrl: "" })}
                      className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full text-xs px-2 hover:bg-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <CldUploadWidget 
                    uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
                    onSuccess={(result: any) => {
                      // 3. When upload succeeds, extract the secure URL and save it to state
                      if (result.info?.secure_url) {
                        setFormData({ ...formData, imageUrl: result.info.secure_url });
                      }
                    }}
                  >
                    {({ open }) => {
                      return (
                        <button 
                          type="button" // Important: prevents form submission
                          onClick={() => open()}
                          className="bg-white text-gray-700 font-medium py-2 px-4 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
                        >
                          Upload an Image
                        </button>
                      );
                    }}
                  </CldUploadWidget>
                )}
                
              </div>
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea name="description" rows={4} value={formData.description} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg shadow-md transition-colors disabled:opacity-50">
              {loading ? "Saving..." : "Save Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}