"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

export default function NewPageForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Upgraded state to handle SEO and the visibility toggle
  const [content, setContent] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    metaTitle: "",
    metaDescription: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
          ...formData,
          content,
          isPublished, // Passes the state of the toggle
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
    <div className="p-10 max-w-7xl mx-auto">
      <div className="flex items-center mb-8">
        <Link href="/admin/pages" className="text-gray-500 hover:text-blue-600 mr-4">
          &larr; Back
        </Link>
        <h1 className="text-3xl font-bold text-gray-800">Create Custom Page</h1>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Main Content & SEO */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Core Content Box */}
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 space-y-6">
            <h2 className="text-lg font-bold text-gray-800 border-b pb-3">Page Content</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Page Title</label>
                <input 
                  type="text" name="title" value={formData.title} onChange={handleChange} 
                  placeholder="Enter the page title (required)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500" required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">URL Slug</label>
                <input 
                  type="text" name="slug" value={formData.slug} onChange={handleChange} 
                  placeholder="Enter the URL slug (required)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500" required 
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
              {/* Added text-gray-900 to this wrapper div */}
              <div className="bg-white rounded-lg border border-gray-300 overflow-hidden text-gray-900">
                <ReactQuill theme="snow" value={content} onChange={setContent} className="h-80" />
              </div>
            </div>
          </div>

          {/* Search Engine Optimization Box */}
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 space-y-6">
            <div className="border-b pb-3">
              <h2 className="text-lg font-bold text-gray-800">Search Engine Optimization</h2>
              <p className="text-sm text-gray-500 mt-1">Adjust how your page appears in Google search results.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Meta Title</label>
              <input 
                type="text" name="metaTitle" value={formData.metaTitle} onChange={handleChange} 
                placeholder="Defaults to Page Title if left blank"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Meta Description</label>
              <textarea 
                name="metaDescription" value={formData.metaDescription} onChange={handleChange} rows={3}
                placeholder="A brief summary of the page for search engines..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500 resize-none" 
              />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Sidebar Controls */}
        <div className="space-y-8">
          
          {/* Visibility Toggle Box */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-3">Visibility</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Publish Page</p>
                <p className="text-sm text-gray-500">Make visible to customers.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsPublished(!isPublished)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isPublished ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isPublished ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Action Box */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg shadow-sm transition-colors disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Page"}
            </button>
            <p className="text-xs text-gray-400 text-center mt-3">
              Ensure all required fields are filled out.
            </p>
          </div>

        </div>
      </form>
    </div>
  );
}