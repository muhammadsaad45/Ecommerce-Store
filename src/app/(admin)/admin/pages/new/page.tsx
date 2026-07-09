"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";

// Dynamically import Quill to prevent Next.js server crashes
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

export default function NewPageForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
  });
  // Quill uses its own state for the HTML content
  const [content, setContent] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          slug: formData.slug,
          content: content, // The raw HTML from Quill
          isPublished: true,
        }),
      });

      if (response.ok) {
        router.push("/admin/pages");
        router.refresh();
      } else {
        const errorData = await response.json();
        alert(`Failed to save page: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Network Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-10 max-w-5xl mx-auto">
      <div className="flex items-center mb-8">
        <Link href="/admin/pages" className="text-gray-500 hover:text-blue-600 mr-4">
          &larr; Back to Pages
        </Link>
        <h1 className="text-3xl font-bold text-gray-800">Create Custom Page</h1>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Page Title</label>
              <input 
                type="text" 
                name="title" 
                value={formData.title} 
                onChange={handleChange} 
                placeholder="e.g., About Us"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black outline-none focus:ring-2 focus:ring-blue-500" 
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">URL Slug</label>
              <input 
                type="text" 
                name="slug" 
                value={formData.slug} 
                onChange={handleChange} 
                placeholder="e.g., about-us"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black outline-none focus:ring-2 focus:ring-blue-500" 
                required 
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Page Content</label>
            {/* The Quill Editor */}
            <div className="bg-white rounded-lg border border-gray-300 overflow-hidden text-black">
              <ReactQuill 
                theme="snow" 
                value={content} 
                onChange={setContent} 
                className="h-96" // Gives the editor plenty of vertical space
              />
            </div>
          </div>

          <div className="pt-12 flex justify-end">
            <button 
              type="submit" 
              disabled={loading} 
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg shadow-md transition-colors disabled:opacity-50"
            >
              {loading ? "Saving..." : "Publish Page"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}