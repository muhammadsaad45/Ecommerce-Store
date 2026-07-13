"use client";

import { useState, useEffect, useRef, useMemo, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { CldUploadWidget } from "next-cloudinary";
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

export default function EditBlogPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const quillRef = useRef<any>(null);
  const [content, setContent] = useState("");
  
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    category: "",
    author: "",
    excerpt: "",
    coverImage: "",
    isPublished: false,
  });

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const response = await fetch(`/api/blogs/${id}`);
        if (response.ok) {
          const data = await response.json();
          setFormData({
            title: data.title || "",
            slug: data.slug || "",
            category: data.category || "",
            author: data.author || "",
            excerpt: data.excerpt || "",
            coverImage: data.coverImage || "",
            isPublished: data.isPublished || false,
          });
          setContent(data.content || "");
        } else {
          alert("Could not find blog post.");
        }
      } catch (error) {
        console.error("Failed to fetch:", error);
      } finally {
        setFetching(false);
      }
    };

    fetchBlog();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement;
    const value = target.type === "checkbox" ? target.checked : target.value;
    setFormData({ ...formData, [target.name]: value });
  };

  const imageHandler = useCallback(() => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    input.onchange = async () => {
      if (input !== null && input.files !== null) {
        const file = input.files[0];
        const uploadData = new FormData();
        uploadData.append("file", file);

        try {
          const response = await fetch("/api/upload", {
            method: "POST",
            body: uploadData,
          });
          const data = await response.json();

          if (data.secure_url) {
            const quill = quillRef.current?.getEditor();
            if (quill) {
              const range = quill.getSelection();
              const index = range ? range.index : quill.getLength();
              quill.insertEmbed(index, "image", data.secure_url);
            }
          }
        } catch (error) {
          console.error("Upload failed", error);
          alert("Failed to upload image");
        }
      }
    };
  }, []);

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, false] }],
          ["bold", "italic", "underline", "strike"],
          [{ list: "ordered" }, { list: "bullet" }],
          ["link", "image"],
          ["clean"],
        ],
        handlers: {
          image: imageHandler,
        },
      },
    }),
    [imageHandler]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch(`/api/blogs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          content,
        }),
      });

      if (response.ok) {
        router.push("/admin/blogs");
        router.refresh(); 
      } else {
        const errorData = await response.json();
        alert(`Failed to update blog: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Network Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="p-10 text-center text-gray-500">Loading blog data...</div>;
  }

  return (
    <div className="p-10 max-w-5xl mx-auto">
      <div className="flex items-center mb-8">
        <Link href="/admin/blogs" className="text-gray-500 hover:text-blue-600 mr-4 transition-colors">
          &larr; Back to Blogs
        </Link>
        <h1 className="text-3xl font-bold text-gray-800">Edit Blog Post</h1>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Post Title</label>
              <input type="text" name="title" value={formData.title} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">URL Slug</label>
              <input type="text" name="slug" value={formData.slug} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <input type="text" name="category" value={formData.category} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Short Excerpt</label>
                <textarea name="excerpt" rows={2} maxLength={300} value={formData.excerpt} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 resize-none" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Main Content</label>
                <div className="bg-white rounded-lg border border-gray-300 overflow-hidden text-gray-900">
                  <ReactQuill
                    // @ts-ignore: Next.js dynamic imports strip ref types, but it works perfectly at runtime
                    ref={quillRef}
                    theme="snow"
                    value={content}
                    onChange={setContent}
                    modules={modules}
                    className="h-80"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6 bg-gray-50 p-6 rounded-xl border border-gray-100">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cover Image</label>
                <div className="h-40 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center bg-white overflow-hidden relative">
                  {formData.coverImage ? (
                    <div className="w-full h-full relative">
                      <img src={formData.coverImage} alt="Cover" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => setFormData({ ...formData, coverImage: "" })} className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full text-xs px-2 hover:bg-red-700 shadow-md">
                        Remove
                      </button>
                    </div>
                  ) : (
                    <CldUploadWidget 
                      uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
                      onSuccess={(result: any) => {
                        if (result.info?.secure_url) {
                          setFormData({ ...formData, coverImage: result.info.secure_url });
                        }
                      }}
                    >
                      {({ open }) => (
                        <button type="button" onClick={() => open()} className="bg-white text-gray-700 font-medium py-2 px-4 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 text-sm">
                          Upload Cover
                        </button>
                      )}
                    </CldUploadWidget>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Author Name</label>
                <input type="text" name="author" value={formData.author} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center mb-6">
                  <input type="checkbox" name="isPublished" id="isPublished" checked={formData.isPublished} onChange={handleChange} className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer" />
                  <label htmlFor="isPublished" className="ml-3 block text-sm font-medium text-gray-900 cursor-pointer">
                    Publish immediately
                  </label>
                </div>

                <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg shadow-md transition-colors disabled:opacity-50">
                  {loading ? "Updating..." : "Update Blog Post"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}