"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProductImageManager from "@/components/ProductImageManager";
import ProductSpecsBuilder, { Spec } from "@/components/ProductSpecsBuilder";
import ProductCategoryEditor from "@/components/ProductCategoryEditor";
import {
  buildSpecsFromSchema,
  DEFAULT_PRODUCT_CATEGORIES,
  ProductCategoryDefinition,
  slugifyCategoryName,
} from "@/lib/productCatalog";

export interface ProductFormData {
  name: string;
  slug: string;
  category: string;
  categorySlug: string;
  description: string;
  price: string;
  stock: string;
  imageUrl: string;
  images: string[];
  isActive: boolean;
  specs: Spec[];
}

export type ProductFormSubmitData = Omit<ProductFormData, "price" | "stock"> & {
  price: number;
  stock: number;
};

export function createEmptyProductFormData(): ProductFormData {
  return {
    name: "",
    slug: "",
    category: "",
    categorySlug: "",
    description: "",
    price: "",
    stock: "",
    imageUrl: "",
    images: [],
    isActive: true,
    specs: [],
  };
}

interface ProductFormProps {
  title: string;
  submitLabel: string;
  loadingLabel: string;
  initialData: ProductFormData;
  onSubmit: (data: ProductFormSubmitData) => Promise<void> | void;
}

export default function ProductForm({ title, submitLabel, loadingLabel, initialData, onSubmit }: ProductFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ProductFormData>(initialData);
  const [categories, setCategories] = useState<ProductCategoryDefinition[]>(DEFAULT_PRODUCT_CATEGORIES);
  const [selectedCategorySlug, setSelectedCategorySlug] = useState(initialData.categorySlug || slugifyCategoryName(initialData.category));
  const [showCategoryEditor, setShowCategoryEditor] = useState(false);

  useEffect(() => {
    setFormData(initialData);
    setSelectedCategorySlug(initialData.categorySlug || slugifyCategoryName(initialData.category));
  }, [initialData]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch("/api/product-categories");
        if (!response.ok) {
          return;
        }

        const data = await response.json();

        if (Array.isArray(data.categories) && data.categories.length > 0) {
          setCategories(data.categories);
        }
      } catch (error) {
        console.error("Failed to load product categories:", error);
      }
    };

    loadCategories();
  }, []);

  useEffect(() => {
    if (!selectedCategorySlug || categories.length === 0) {
      if (!selectedCategorySlug && categories[0]) {
        setSelectedCategorySlug(categories[0].slug);
      }

      return;
    }

    const selectedCategory = categories.find((category) => category.slug === selectedCategorySlug);

    if (!selectedCategory) {
      return;
    }

    setFormData((currentFormData) => {
      const nextSpecs = buildSpecsFromSchema(selectedCategory, currentFormData.specs);
      const categoryMatches = currentFormData.category === selectedCategory.name && currentFormData.categorySlug === selectedCategory.slug;
      const specsMatch = JSON.stringify(nextSpecs) === JSON.stringify(currentFormData.specs);

      if (categoryMatches && specsMatch) {
        return currentFormData;
      }

      return {
        ...currentFormData,
        category: selectedCategory.name,
        categorySlug: selectedCategory.slug,
        specs: nextSpecs,
      };
    });
  }, [categories, selectedCategorySlug]);

  const handleCategoryCreated = (category: ProductCategoryDefinition) => {
    setCategories((currentCategories) => [...currentCategories, category].sort((a, b) => a.name.localeCompare(b.name)));
    setSelectedCategorySlug(category.slug);
    setShowCategoryEditor(false);
  };

  const syncImages = (images: string[]) => {
    setFormData((currentFormData) => ({
      ...currentFormData,
      images,
      imageUrl: images[0] || "",
    }));
  };

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
      await onSubmit({
        ...formData,
        price: Number(formData.price),
        stock: Number(formData.stock),
        imageUrl: formData.images[0] || formData.imageUrl,
        images: formData.images,
      });
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
        <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                  <div className="flex gap-2">
                    <select value={selectedCategorySlug} onChange={(e) => setSelectedCategorySlug(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 bg-white" required>
                      <option value="" disabled>Select a category</option>
                      {categories.map((category) => (
                        <option key={category.slug} value={category.slug}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    <button type="button" onClick={() => setShowCategoryEditor(true)} className="shrink-0 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100">
                      New
                    </button>
                  </div>
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

            <div>
              <ProductImageManager images={formData.images} onChange={syncImages} label="Product Images" />
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea name="description" rows={4} value={formData.description} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 resize-none" required />
            </div>
          </div>

          <ProductSpecsBuilder
            schema={categories.find((category) => category.slug === selectedCategorySlug) || null}
            specs={formData.specs}
            onChange={(updatedSpecs) => setFormData((currentFormData) => ({ ...currentFormData, specs: updatedSpecs }))}
          />

          <div className="pt-6 border-t border-gray-100 flex justify-end">
            <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg shadow-md transition-colors disabled:opacity-50">
              {loading ? loadingLabel : submitLabel}
            </button>
          </div>
        </form>
      </div>

      <ProductCategoryEditor
        open={showCategoryEditor}
        onClose={() => setShowCategoryEditor(false)}
        onCreated={handleCategoryCreated}
      />
    </div>
  );
}