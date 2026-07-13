"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import Link from "next/link";

export default function CartMenu() {
  const [isOpen, setIsOpen] = useState(false);
  // We added addToCart here so we can increment/decrement!
  const { cart, cartCount, cartTotal, removeFromCart, addToCart } = useCart();

  // Helper function to safely reduce quantity or remove the item completely
  const handleDecrement = (item: any) => {
    if (item.quantity <= 1) {
      removeFromCart(item._id);
    } else {
      addToCart(item, -1);
    }
  };

  // Helper function to safely increase quantity while respecting stock limits
  const handleIncrement = (item: any) => {
    if (item.quantity < item.stock) {
      addToCart(item, 1);
    }
  };

  return (
    <>
      {/* 1. The Navbar Button & Badge */}
      <button 
        onClick={() => setIsOpen(true)}
        className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors focus:outline-none"
        aria-label="Open Cart"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
        
        {cartCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-[10px] font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
            {cartCount}
          </span>
        )}
      </button>

      {/* 2. The Background Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* 3. The Slide-Out Drawer */}
      <div 
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Your Cart</h2>
          <button 
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <p>Your cart is totally empty.</p>
              <button onClick={() => setIsOpen(false)} className="text-blue-600 hover:underline font-medium">
                Continue Shopping
              </button>
            </div>
          ) : (
            <ul className="space-y-6">
              {cart.map((item) => (
                <li key={item._id} className="flex items-center space-x-4 border-b border-gray-50 pb-6 last:border-0 last:pb-0">
                  
                  {/* Product Image */}
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-md border border-gray-200 bg-gray-50 p-2">
                    <img src={item.imageUrl} alt={item.name} className="h-full w-full object-contain" />
                  </div>
                  
                  {/* Product Details & Actions */}
                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between text-base font-medium text-gray-900">
                      <h3 className="line-clamp-1 pr-4">
                        <Link href={`/products/${item.slug}`} onClick={() => setIsOpen(false)}>
                          {item.name}
                        </Link>
                      </h3>
                      <p className="ml-4">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                    
                    <div className="flex items-end justify-between mt-3">
                      
                      {/* NEW: Mini Quantity Selector */}
                      <div className="flex items-center border border-gray-200 rounded-md bg-white">
                        <button 
                          onClick={() => handleDecrement(item)}
                          className="px-2 py-1 text-gray-500 hover:text-blue-600 hover:bg-gray-50 transition-colors rounded-l-md outline-none"
                        >
                          &minus;
                        </button>
                        <span className="px-3 py-1 text-xs font-medium text-gray-900 border-x border-gray-100 text-center min-w-8">
                          {item.quantity}
                        </span>
                        <button 
                          onClick={() => handleIncrement(item)}
                          disabled={item.quantity >= item.stock}
                          className="px-2 py-1 text-gray-500 hover:text-blue-600 hover:bg-gray-50 transition-colors rounded-r-md outline-none disabled:opacity-50 disabled:hover:text-gray-500"
                        >
                          &#43;
                        </button>
                      </div>

                      {/* NEW: Trash Icon Button */}
                      <button 
                        type="button" 
                        onClick={() => removeFromCart(item._id)}
                        className="text-gray-400 hover:text-red-600 transition-colors p-1"
                        title="Remove item"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>

                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {cart.length > 0 && (
          <div className="border-t border-gray-100 p-6 bg-gray-50">
            <div className="flex justify-between text-base font-medium text-gray-900 mb-6">
              <p>Subtotal</p>
              <p className="text-2xl font-black">${cartTotal.toFixed(2)}</p>
            </div>
            <p className="text-sm text-gray-500 mb-6">Shipping and taxes calculated at checkout.</p>
            <Link 
              href="/checkout" 
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center w-full rounded-xl bg-blue-600 px-6 py-4 text-base font-bold text-white shadow-lg hover:bg-blue-700 transition-all active:scale-[0.98]"
            >
              Secure Checkout
            </Link>
          </div>
        )}
      </div>
    </>
  );
}