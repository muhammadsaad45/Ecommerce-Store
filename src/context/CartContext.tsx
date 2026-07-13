"use client";

import { createContext, useContext, useState, useEffect } from "react";

// Define the structure of a single item sitting inside the cart
interface CartItem {
  _id: string;
  name: string;
  price: number;
  imageUrl: string;
  slug: string;
  quantity: number;
  stock: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: any, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  // 1. On component mount, safely pull the saved cart from browser local storage
  useEffect(() => {
    const savedCart = localStorage.getItem("techstore_cart");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (error) {
        console.error("Failed to parse cart data:", error);
      }
    }
  }, []);

  // 2. Any time the cart state updates, sync it right back to local storage
  useEffect(() => {
    localStorage.setItem("techstore_cart", JSON.stringify(cart));
  }, [cart]);

  // 3. Add to Cart Core Logic
  const addToCart = (product: any, quantity: number) => {
    setCart((prevCart) => {
      // Check if the item is already sitting in the cart
      const existingItem = prevCart.find((item) => item._id === product._id);

      if (existingItem) {
        // If it exists, recalculate its new quantity while protecting stock limits
        return prevCart.map((item) =>
          item._id === product._id
            ? { ...item, quantity: Math.min(item.stock, item.quantity + quantity) }
            : item
        );
      }

      // If it's a completely brand new item, add it to the array
      return [
        ...prevCart,
        {
          _id: product._id,
          name: product.name,
          price: product.price,
          imageUrl: product.imageUrl,
          slug: product.slug,
          stock: product.stock,
          quantity,
        },
      ];
    });
  };

  // 4. Remove an item entirely
  const removeFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item._id !== productId));
  };

  // 5. Empty out the entire cart (For checkouts)
  const clearCart = () => setCart([]);

  // 6. Dynamic Derived Values (Calculated instantly on render)
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, clearCart, cartCount, cartTotal }}
    >
      {children}
    </CartContext.Provider>
  );
}

// Custom hook for simple, clean imports in our other components
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used inside a CartProvider wrapper");
  }
  return context;
}