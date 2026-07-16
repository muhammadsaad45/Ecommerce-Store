"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface FilterSidebarProps {
  dbCategories: string[];
  dbSpecs: Record<string, string[]>;
}

export default function FilterSidebar({ dbCategories, dbSpecs }: FilterSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Local state synced with URL parameters
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [maxPrice, setMaxPrice] = useState(2000);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortParam, setSortParam] = useState("newest");
  
  // Track dynamic specs like { Brand: "Apple", Processor: "Snapdragon" }
  const [selectedSpecs, setSelectedSpecs] = useState<Record<string, string>>({});

  useEffect(() => {
    setSelectedCategory(searchParams.get("category") || "All");
    setMaxPrice(Number(searchParams.get("maxPrice")) || 2000);
    setInStockOnly(searchParams.get("inStock") === "true");
    setSortParam(searchParams.get("sort") || "newest");

    // Rehydrate dynamic specs from URL
    const specsState: Record<string, string> = {};
    Object.keys(dbSpecs).forEach(specKey => {
      const urlValue = searchParams.get(specKey);
      if (urlValue) specsState[specKey] = urlValue;
    });
    setSelectedSpecs(specsState);
  }, [searchParams, dbSpecs]);

  const updateFilters = (updates: any) => {
    const params = new URLSearchParams(searchParams.toString());

    // Handle standard keys (category, sort, maxPrice, inStock)
    Object.keys(updates).forEach(key => {
      if (updates[key] === "All" || updates[key] === 2000 || updates[key] === false || updates[key] === "") {
        params.delete(key);
      } else {
        params.set(key, updates[key].toString());
      }
    });

    router.push(`${pathname}?${params.toString()}`);
  };

  const handleClearAll = () => {
    const params = new URLSearchParams();
    const currentQuery = searchParams.get("q");
    if (currentQuery) params.set("q", currentQuery);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="w-full bg-white p-6 rounded-2xl border border-gray-100 space-y-8 sticky top-24">
      <div className="flex justify-between items-center pb-4 border-b border-gray-100">
        <h3 className="font-bold text-gray-900 text-lg">Filters</h3>
        <button onClick={handleClearAll} className="text-xs text-blue-600 font-bold hover:underline">Reset</button>
      </div>

      {/* Sorting Dropdown */}
      <div className="space-y-3">
        <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider">Sort By</h4>
        <select 
          value={sortParam} 
          onChange={(e) => {
            setSortParam(e.target.value);
            updateFilters({ sort: e.target.value });
          }}
          className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 outline-none cursor-pointer"
        >
          <option value="newest">Newest Added</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>

      {/* Dynamic Database Categories */}
      {dbCategories.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider">Category</h4>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input type="radio" checked={selectedCategory === "All"} onChange={() => updateFilters({ category: "All" })} className="h-4 w-4 text-blue-600 cursor-pointer" />
              <span className={`text-sm ${selectedCategory === "All" ? "text-blue-600 font-semibold" : "text-gray-600"}`}>All Categories</span>
            </label>
            {dbCategories.map((cat) => (
              <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                <input type="radio" checked={selectedCategory === cat} onChange={() => updateFilters({ category: cat })} className="h-4 w-4 text-blue-600 cursor-pointer" />
                <span className={`text-sm ${selectedCategory === cat ? "text-blue-600 font-semibold" : "text-gray-600"}`}>{cat}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Dynamic Database Specs (Brands, Processors) */}
      {Object.entries(dbSpecs).map(([specKey, specValues]) => (
        <div key={specKey} className="space-y-3">
          <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider">{specKey}</h4>
          <div className="flex flex-col gap-2 max-h-40 overflow-y-auto scrollbar-hide">
             <label className="flex items-center gap-3 cursor-pointer group">
                <input type="radio" checked={!selectedSpecs[specKey]} onChange={() => updateFilters({ [specKey]: "" })} className="h-4 w-4 text-blue-600 cursor-pointer" />
                <span className={`text-sm ${!selectedSpecs[specKey] ? "text-blue-600 font-semibold" : "text-gray-600"}`}>Any {specKey}</span>
              </label>
            {specValues.map((val) => (
              <label key={val} className="flex items-center gap-3 cursor-pointer group">
                <input type="radio" checked={selectedSpecs[specKey] === val} onChange={() => updateFilters({ [specKey]: val })} className="h-4 w-4 text-blue-600 cursor-pointer" />
                <span className={`text-sm ${selectedSpecs[specKey] === val ? "text-blue-600 font-semibold" : "text-gray-600"}`}>{val}</span>
              </label>
            ))}
          </div>
        </div>
      ))}

      {/* Price Slider */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider">Max Price</h4>
          <span className="text-sm font-bold text-gray-900">${maxPrice}</span>
        </div>
        <input type="range" min="50" max="2000" step="50" value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} onMouseUp={() => updateFilters({ maxPrice })} onTouchEnd={() => updateFilters({ maxPrice })} className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-blue-600" />
      </div>

      {/* Stock Toggle */}
      <div className="pt-4 border-t border-gray-100">
        <label className="flex items-center justify-between cursor-pointer group">
          <span className="text-sm font-medium text-gray-700">In Stock Only</span>
          <input type="checkbox" checked={inStockOnly} onChange={(e) => updateFilters({ inStock: e.target.checked })} className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-600" />
        </label>
      </div>
    </div>
  );
}