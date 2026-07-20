"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createSpecFilterParam, getRelevantSpecFilters, ProductCategoryDefinition, resolveCategoryByIdentifier } from "@/lib/productCatalog";

interface FilterSidebarProps {
  categories: ProductCategoryDefinition[];
  specValuesByParam: Record<string, string[]>;
}

function removeSpecFilters(params: URLSearchParams) {
  Array.from(params.keys()).forEach((key) => {
    if (key.startsWith("spec_")) {
      params.delete(key);
    }
  });
}

export default function FilterSidebar({ categories, specValuesByParam }: FilterSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [maxPrice, setMaxPrice] = useState(2000);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortParam, setSortParam] = useState("newest");

  useEffect(() => {
    setMaxPrice(Number(searchParams.get("maxPrice")) || 2000);
    setInStockOnly(searchParams.get("inStock") === "true");
    setSortParam(searchParams.get("sort") || "newest");
  }, [searchParams]);

  const updateFilters = (
    updates: Record<string, string | number | boolean | undefined>,
    options?: { clearSpecFilters?: boolean }
  ) => {
    const params = new URLSearchParams(searchParams.toString());

    if (options?.clearSpecFilters) {
      removeSpecFilters(params);
    }

    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === "" || value === false || value === "All" || value === 2000) {
        params.delete(key);
      } else {
        params.set(key, value.toString());
      }
    });

    const queryString = params.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname);
  };

  const handleClearAll = () => {
    const params = new URLSearchParams();
    const currentQuery = searchParams.get("q");
    if (currentQuery) {
      params.set("q", currentQuery);
    }

    const queryString = params.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname);
  };

  const selectedCategory = resolveCategoryByIdentifier(categories, searchParams.get("category"));
  const currentCategoryValue = searchParams.get("category") || "";
  const relevantSpecFilters = selectedCategory ? getRelevantSpecFilters(selectedCategory) : [];

  return (
    <div className="w-full bg-white p-6 rounded-2xl border border-gray-100 space-y-8 sticky top-24">
      <div className="flex justify-between items-center pb-4 border-b border-gray-100">
        <h3 className="font-bold text-gray-900 text-lg">Filters</h3>
        <button onClick={handleClearAll} className="text-xs text-blue-600 font-bold hover:underline">Reset</button>
      </div>

      <div className="space-y-3">
        <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider">Category</h4>
        <select
          value={currentCategoryValue}
          onChange={(e) => updateFilters({ category: e.target.value }, { clearSpecFilters: true })}
          className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 outline-none cursor-pointer"
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category.slug} value={category.slug}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

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

      {selectedCategory ? (
        <div className="space-y-4">
          <div>
            <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider">Category Specs</h4>
            <p className="mt-1 text-xs text-gray-500">Filtering options follow the selected category schema.</p>
          </div>

          {selectedCategory.specGroups.map((group) => {
            const visibleKeys = group.keys.filter((key) => relevantSpecFilters.some((filter) => filter.group === group.group && filter.key === key));

            if (visibleKeys.length === 0) {
              return null;
            }

            return (
              <div key={group.group} className="space-y-3 rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <h5 className="text-xs font-black uppercase text-gray-500 tracking-wider">{group.group}</h5>
                <div className="space-y-3">
                  {visibleKeys.map((key) => {
                    const paramName = createSpecFilterParam(group.group, key);
                    const selectedValue = searchParams.get(paramName) || "";
                    const availableValues = specValuesByParam[paramName] || [];

                    return (
                      <label key={paramName} className="block space-y-1.5">
                        <span className="block text-sm font-medium text-gray-700">{key}</span>
                        <select
                          value={selectedValue}
                          onChange={(e) => updateFilters({ [paramName]: e.target.value })}
                          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Any {key}</option>
                          {availableValues.length > 0 ? (
                            availableValues.map((value) => (
                              <option key={value} value={value}>
                                {value}
                              </option>
                            ))
                          ) : (
                            <option value="" disabled>
                              No available values yet
                            </option>
                          )}
                        </select>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-gray-500">
          Select a category to reveal its specific filters.
        </div>
      )}

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider">Max Price</h4>
          <span className="text-sm font-bold text-gray-900">${maxPrice}</span>
        </div>
        <input
          type="range"
          min="50"
          max="20000"
          step="50"
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          onMouseUp={() => updateFilters({ maxPrice })}
          onTouchEnd={() => updateFilters({ maxPrice })}
          className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
      </div>

      <div className="pt-4 border-t border-gray-100">
        <label className="flex items-center justify-between cursor-pointer group">
          <span className="text-sm font-medium text-gray-700">In Stock Only</span>
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => {
              setInStockOnly(e.target.checked);
              updateFilters({ inStock: e.target.checked });
            }}
            className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
          />
        </label>
      </div>
    </div>
  );
}
