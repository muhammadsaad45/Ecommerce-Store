"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";

export default function AddToCart({ product }: { product: any }) {
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false); // New state for our premium UX
  
  // Bring in the powerhouse function from our global context
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    // 1. Dispatch to global state
    addToCart(product, quantity);
    
    // 2. Trigger the success UI
    setIsAdded(true);
    
    // 3. Reset the button after 2 seconds
    setTimeout(() => setIsAdded(false), 2000);
  };

  if (product.stock <= 0) {
    return (
      <div className="w-full bg-gray-100 text-gray-500 font-bold py-4 px-8 rounded-xl text-center cursor-not-allowed">
        Out of Stock
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <span className="text-sm font-medium text-gray-700">Quantity</span>
        <div className="flex items-center border border-gray-300 rounded-lg bg-white">
          <button 
            type="button"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="px-4 py-2 text-gray-600 hover:text-blue-600 hover:bg-gray-50 transition-colors rounded-l-lg outline-none"
            disabled={quantity <= 1}
          >
            &minus;
          </button>
          <span className="px-4 py-2 text-gray-900 font-medium w-12 text-center border-x border-gray-200">
            {quantity}
          </span>
          <button 
            type="button"
            onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
            className="px-4 py-2 text-gray-600 hover:text-blue-600 hover:bg-gray-50 transition-colors rounded-r-lg outline-none"
            disabled={quantity >= product.stock}
          >
            &#43;
          </button>
        </div>
        <span className="text-sm text-gray-500">
          {product.stock} available
        </span>
      </div>

      <button 
        onClick={handleAddToCart}
        disabled={isAdded}
        className={`w-full font-extrabold py-4 px-8 rounded-xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center space-x-2 ${
          isAdded 
            ? "bg-green-500 hover:bg-green-600 text-white shadow-green-200" 
            : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200"
        }`}
      >
        {isAdded ? (
          <>
            {/* Success Checkmark Icon */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
            <span>Added to Cart!</span>
          </>
        ) : (
          <>
            {/* Standard Cart Icon */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>Add to Cart</span>
          </>
        )}
      </button>
    </div>
  );
}