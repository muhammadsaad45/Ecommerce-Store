"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ProductImageManager from "@/components/ProductImageManager";

// 1. Import the Builder and Spec interface
import ProductSpecsBuilder, { Spec } from "@/components/ProductSpecsBuilder";

// 2. Define the exact blueprint so TypeScript knows about specs
interface ProductFormData {
  name: string;
  slug: string;
  category: string;
  description: string;
  price: string;
  stock: string;
  imageUrl: string;
  images: string[];
  isActive: boolean;
  specs: Spec[]; // <-- Explicitly added to the blueprint
}

type ProductSpecPayload = {
  group?: string;
  key?: string;
  value?: string;
};

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  // 3. Attach the blueprint to useState and initialize specs
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    slug: "",
    category: "",
    description: "",
    price: "",
    stock: "",
    imageUrl: "",
    images: [],
    isActive: true,
    specs: [],
  });

  const syncImages = (images: string[]) => {
    setFormData((currentFormData) => ({
      ...currentFormData,
      images,
      imageUrl: images[0] || "",
    }));
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${id}`);
        if (response.ok) {
          const data = await response.json();
          // 4. Pre-fill the fields AND safely map the incoming database specs
          setFormData({
            name: data.name || "",
            slug: data.slug || "",
            category: data.category || "",
            description: data.description || "",
            price: data.price ? data.price.toString() : "0",
            stock: data.stock ? data.stock.toString() : "0",
            imageUrl: data.imageUrl || data.images?.[0] || "",
            images: data.images?.length > 0 ? data.images : data.imageUrl ? [data.imageUrl] : [],
            isActive: data.isActive !== undefined ? data.isActive : true,
            // Strip out hidden MongoDB _id tags before handing data to the client component
            specs: data.specs?.map((spec: ProductSpecPayload) => ({
              group: spec.group,
              key: spec.key,
              value: spec.value,
            })) || [],
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
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = e.target as HTMLInputElement;
    const value = target.type === "checkbox" ? target.checked : target.value;
    
    setFormData((currentFormData) => ({ ...currentFormData, [target.name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.images.length === 0) {
      alert("Please upload a product image first.");
      return;
    }

    setLoading(true);
    
    try {
      const formattedData = {
        ...formData,
        price: Number(formData.price),
        stock: Number(formData.stock),
        imageUrl: formData.images[0] || formData.imageUrl,
        images: formData.images,
      };

      const response = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formattedData),
      });

      if (response.ok) {
        router.push("/admin/products");
        router.refresh(); 
      } else {
        const errorData = await response.json();
        alert(`Failed to update product: ${errorData.error || "Unknown error"}`);
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Left Column: Text Inputs */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">URL Slug</label>
                  <input type="text" name="slug" value={formData.slug} onChange={handleChange} placeholder="e.g., iphone-15" className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <input type="text" name="category" value={formData.category} onChange={handleChange} placeholder="e.g., Smartphones" className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price ($)</label>
                  <input type="number" name="price" min="0" step="0.01" value={formData.price} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Stock</label>
                  <input type="number" name="stock" min="0" value={formData.stock} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
              </div>

              <div className="flex items-center pt-2">
                <input 
                  type="checkbox" 
                  name="isActive" 
                  id="isActive" 
                  checked={formData.isActive} 
                  onChange={handleChange} 
                  className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer" 
                />
                <label htmlFor="isActive" className="ml-3 block text-sm font-medium text-gray-700 cursor-pointer">
                  Product is Active (Visible to customers)
                </label>
              </div>
            </div>

            {/* Right Column: Image Upload Area */}
            <div>
              <ProductImageManager images={formData.images} onChange={syncImages} label="Product Images" />
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea name="description" rows={4} value={formData.description} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 resize-none" required />
            </div>
          </div>

          {/* 5. Inject the Spec Builder Matrix Component */}
          <ProductSpecsBuilder 
            specs={formData.specs}
            onChange={(updatedSpecs) => setFormData({ ...formData, specs: updatedSpecs })}
          />

          <div className="pt-6 border-t border-gray-100 flex justify-end">
            <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg shadow-md transition-colors disabled:opacity-50">
              {loading ? "Updating..." : "Update Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}