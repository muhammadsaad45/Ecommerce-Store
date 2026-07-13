"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminBlogsDashboard() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBlogs = async () => {
    try {
      const res = await fetch("/api/blogs");
      if (res.ok) {
        const data = await res.json();
        setBlogs(data);
      }
    } catch (error) {
      console.error("Failed to fetch blogs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this blog post? This cannot be undone.")) {
      return;
    }

    try {
      const res = await fetch(`/api/blogs/${id}`, { method: "DELETE" });
      if (res.ok) {
        // Remove the deleted blog from the UI instantly
        setBlogs(blogs.filter((blog) => blog._id !== id));
      } else {
        alert("Failed to delete blog post.");
      }
    } catch (error) {
      console.error("Error deleting blog:", error);
    }
  };

  return (
    <div className="p-10 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Blog Posts</h1>
          <p className="text-gray-500 mt-1">Manage your articles, news, and guides.</p>
        </div>
        <Link 
          href="/admin/blogs/new" 
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg shadow-sm transition-colors"
        >
          + Write New Post
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-500">Loading blogs...</div>
        ) : blogs.length === 0 ? (
          <div className="p-10 text-center text-gray-500">No blog posts found. Start writing!</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-sm uppercase tracking-wider">
                <th className="px-6 py-4 font-medium">Title</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {blogs.map((blog) => (
                <tr key={blog._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-gray-900">{blog.title}</p>
                    <p className="text-xs text-gray-500 mt-1">/{blog.slug}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {blog.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {blog.isPublished ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Published
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Draft
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium space-x-4">
                    <Link
                      href={blog.isPublished ? `/blogs/${blog.slug}` : `/blogs/${blog.slug}?preview=true`}
                      target="_blank"
                      className="text-gray-500 hover:text-gray-700"
                    >
                      View
                    </Link>
                    <Link href={`/admin/blogs/edit/${blog._id}`} className="text-blue-600 hover:text-blue-900">
                      Edit
                    </Link>
                    <button onClick={() => handleDelete(blog._id)} className="text-red-600 hover:text-red-900">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}