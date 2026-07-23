"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

interface Suggestion {
  _id: string;
  name: string;
  slug: string;
  price: number;
  imageUrl: string;
}

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Suggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  const router = useRouter();
  const pathname = usePathname();
  
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 1. UPGRADED: Always slam the dropdown shut on ANY route change
  useEffect(() => {
    setIsOpen(false);
    if (!pathname.startsWith('/search')) {
      setQuery("");
    }
  }, [pathname]);

  // 2. Close dropdown if the user clicks anywhere else on the screen
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 3. The Debouncer
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const fetchSuggestions = async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        console.log(data);
        setResults(data.products || []);
        
        // UPGRADED THE RACE CONDITION FIX: 
        // Only open the dropdown if the cursor is STILL inside the input box!
        if (document.activeElement === inputRef.current) {
          setIsOpen(true);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchSuggestions();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [query]);

  // 4. Handle full page search submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setIsOpen(false);
      inputRef.current?.blur(); // This removes active focus, triggering our safety check!
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="relative w-full max-w-lg" ref={searchRef}>
      <form onSubmit={handleSubmit} className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          // NEW FIX: If they click back into the input and there is text, reopen the dropdown!
          onFocus={() => { if (results.length > 0) setIsOpen(true) }} 
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for products, brands, or specs..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all bg-gray-50 focus:bg-white text-sm"
        />
        <div className="absolute left-3 top-2.5 text-gray-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </form>

      {/* Floating Dropdown Results */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
          {isSearching ? (
            <div className="p-4 text-center text-sm text-gray-500">Searching...</div>
          ) : results.length > 0 ? (
            <ul className="max-h-96 overflow-y-auto">
              {results.map((product) => (
                <li key={product._id} className="border-b border-gray-50 last:border-0">
                  <Link 
                    href={`/products/${product.slug}`}
                    onClick={() => {
                      setIsOpen(false);
                      setQuery("");
                    }}
                    className="flex items-center p-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-12 h-12 bg-gray-50 rounded-lg shrink-0 flex items-center justify-center p-1 mr-4 border border-gray-100">
                      <img src={product.imageUrl} alt={product.name} className="max-w-full max-h-full object-contain mix-blend-multiply" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{product.name}</p>
                      <p className="text-sm font-black text-blue-600">${product.price.toFixed(2)}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-sm text-gray-500">
              No products found for "{query}"
            </div>
          )}
          
          {results.length > 0 && (
            <button 
              onClick={handleSubmit}
              className="w-full text-center p-3 bg-gray-50 hover:bg-gray-100 text-sm font-semibold text-blue-600 transition-colors border-t border-gray-100"
            >
              See all results for "{query}" &rarr;
            </button>
          )}
        </div>
      )}
    </div>
  );
}