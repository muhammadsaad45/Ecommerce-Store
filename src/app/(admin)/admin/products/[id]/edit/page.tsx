"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProductForm, { createEmptyProductFormData, ProductFormData, ProductFormSubmitData } from "@/components/ProductForm";

type ProductSpecPayload = {
  group?: string;
  key?: string;
  value?: string;
};

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [productId, setProductId] = useState<string | null>(null);

  const [fetching, setFetching] = useState(true);

  const [initialData, setInitialData] = useState<ProductFormData>(createEmptyProductFormData());

  useEffect(() => {
    params.then(({ id }) => {
      setProductId(id);
    });

    const fetchProduct = async () => {
      try {
        const { id } = await params;
        const response = await fetch(`/api/products/${id}`);
        if (response.ok) {
          const data = await response.json();
          setInitialData({
            name: data.name || "",
            slug: data.slug || "",
            category: data.category || "",
            categorySlug: data.categorySlug || "",
            description: data.description || "",
            price: data.price ? data.price.toString() : "0",
            stock: data.stock ? data.stock.toString() : "0",
            imageUrl: data.imageUrl || data.images?.[0] || "",
            images: data.images?.length > 0 ? data.images : data.imageUrl ? [data.imageUrl] : [],
            isActive: data.isActive !== undefined ? data.isActive : true,
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
  }, [params]);

  if (fetching) {
    return <div className="p-10 text-center text-gray-500">Loading product data...</div>;
  }

  const handleSubmit = async (data: ProductFormSubmitData) => {
    if (!productId) {
      throw new Error("Missing product id");
    }

    const response = await fetch(`/api/products/${productId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      router.push("/admin/products");
      router.refresh();
      return;
    }

    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to update product");
  };

  return <ProductForm title="Edit Product" submitLabel="Update Product" loadingLabel="Updating..." initialData={initialData} onSubmit={handleSubmit} />;
}