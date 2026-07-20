import Link from "next/link";
import { getMergedProductCategories } from "@/lib/productCategoryQueries";

export const metadata = {
  title: "Shop by Category | TechStore",
  description: "Browse our products by category.",
};

export default async function CategoriesPage() {
  const categories = (await getMergedProductCategories()).map((category) => category.name).filter(Boolean).sort();

  return (
    <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 mt-4">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
          Shop by Category
        </h1>
        <p className="text-lg text-gray-500">
          Find exactly what you're looking for by browsing our curated collections.
        </p>
      </div>

      {categories.length === 0 ? (
        // The Empty State
        <div className="text-center py-16">
          <p className="text-gray-500">No categories found.</p>
        </div>
      ) : (
        // The Category Grid
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Link 
              key={category} 
              // Routes to the search page, automatically filtering by this category
              href={`/search?category=${encodeURIComponent(category)}`}
              className="group relative bg-gray-50 rounded-2xl p-8 border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all text-center flex flex-col items-center justify-center overflow-hidden"
            >
              {/* Optional background accent on hover */}
              <div className="absolute inset-0 bg-blue-50 opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <h2 className="relative text-2xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors capitalize">
                {category}
              </h2>
              <span className="relative mt-2 text-sm font-medium text-gray-500 group-hover:text-blue-600 transition-colors">
                Explore Collection &rarr;
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}