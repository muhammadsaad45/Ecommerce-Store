"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteProductButton({ id }: { id: string }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    // 1. Always ask for confirmation before deleting data!
    const confirmed = window.confirm("Are you sure you want to delete this product?");
    if (!confirmed) return;

    setIsDeleting(true);

    try {
      // 2. Call our new DELETE route
      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // 3. Force the server table to fetch the new, updated list
        router.refresh(); 
      } else {
        alert("Failed to delete product.");
      }
    } catch (error) {
      console.error("Network Error:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors disabled:opacity-50"
    >
      {isDeleting ? "Deleting..." : "Delete"}
    </button>
  );
}