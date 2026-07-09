"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeletePageButton({ pageId }: { pageId: string }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this page?")) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/pages?id=${pageId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.refresh(); // Tells the server component to re-fetch the data
      } else {
        alert("Failed to delete page.");
      }
    } catch (error) {
      console.error("Error deleting page:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-red-600 hover:text-red-900 font-medium disabled:opacity-50"
    >
      {isDeleting ? "Deleting..." : "Delete"}
    </button>
  );
}