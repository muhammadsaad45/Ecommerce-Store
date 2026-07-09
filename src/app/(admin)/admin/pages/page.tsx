import Link from "next/link";
import { connectToDatabase } from "@/lib/mongodb";
import Page from "@/models/Page";
import DeletePageButton from "./DeletePageButton";

// Force Next.js to always fetch fresh data when loading this page
export const revalidate = 0;

export default async function PagesDashboard() {
  await connectToDatabase();
  // Fetch all pages from MongoDB
  const pages = await Page.find({}).sort({ createdAt: -1 }).lean();

  return (
    <div className="p-10 max-w-6xl mx-auto">
      {/* Header Area */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Pages</h1>
          <p className="text-gray-500 mt-1">Manage your custom storefront pages.</p>
        </div>
        <Link
          href="/admin/pages/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
        >
          + Add New Page
        </Link>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {pages.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            No pages found. Click the button above to create one.
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-600 uppercase tracking-wider">
                <th className="p-4 font-semibold">Title</th>
                <th className="p-4 font-semibold">URL Slug</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {pages.map((page: any) => (
                <tr key={page._id.toString()} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 text-gray-900 font-medium">
                    {page.title}
                  </td>
                  <td className="p-4 text-gray-500 font-mono text-sm">
                    /{page.slug}
                  </td>
                  <td className="p-4">
                    <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-1 rounded-full">
                      {page.isPublished ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-4">
                    <Link 
                      href={`/pages/${page.slug}`} 
                      target="_blank"
                      className="text-blue-600 hover:text-blue-900 font-medium"
                    >
                      View
                    </Link>
                    <DeletePageButton pageId={page._id.toString()} />
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