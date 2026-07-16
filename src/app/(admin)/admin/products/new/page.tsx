"use client";

import { useRouter } from "next/navigation";
import ProductForm, { createEmptyProductFormData, ProductFormSubmitData } from "@/components/ProductForm";

export default function NewProductPage() {
  const router = useRouter();
  const handleSubmit = async (data: ProductFormSubmitData) => {
    const response = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      router.push("/admin/products");
      router.refresh();
      return;
    }

    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to save product");
  };

  return <ProductForm title="Add New Product" submitLabel="Save Product" loadingLabel="Saving..." initialData={createEmptyProductFormData()} onSubmit={handleSubmit} />;
}