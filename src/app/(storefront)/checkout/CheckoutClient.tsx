"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Define the types for the props we are receiving from the server
interface CheckoutClientProps {
  user: { 
    name?: string | null; // Allow name to be optional or null to match NextAuth
    email: string; 
  } | null;
  savedAddresses: any[];
}

export default function CheckoutClient({ user, savedAddresses }: CheckoutClientProps) {
  const router = useRouter();
  const { cart, cartTotal, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);

const defaultFirstName = user?.name?.split(" ")[0] || "";
const defaultLastName = user?.name?.split(" ").slice(1).join(" ") || "";

  const [formData, setFormData] = useState({
    email: user?.email || "", 
    firstName: defaultFirstName, 
    lastName: defaultLastName, 
    address: "", 
    city: "", 
    zip: "",
    cardNumber: "", 
    expDate: "", 
    cvv: ""
  });

  // Calculate standard $10 shipping, or FREE if over $100
  const shippingCost = cartTotal > 100 ? 0 : 10;
  const finalTotal = cartTotal + shippingCost;

  // Auto-select the default address if they have one on load
  useEffect(() => {
    const defaultAddress = savedAddresses.find(addr => addr.isDefault);
    if (defaultAddress) {
      handleSelectAddress(defaultAddress);
    }
  }, [savedAddresses]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Helper function to quickly swap addresses when a user clicks a saved card
  const handleSelectAddress = (addr: any) => {
    setFormData(prev => ({
      ...prev,
      address: addr.street,
      city: addr.city,
      zip: addr.zipCode,
    }));
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: formData,
          items: cart.map((item) => ({
            product: item._id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          })),
          subtotal: cartTotal,
          shippingCost,
          total: finalTotal,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        clearCart(); 
        router.push(`/order/${data.orderNumber.toString()}`); 
      } else {
        alert("Something went wrong processing your order. Please try again.");
        setIsProcessing(false);
      }
    } catch (error) {
      console.error("Checkout connection error:", error);
      alert("Failed to connect to the secure server.");
      setIsProcessing(false);
    }
  };

  // If the user navigates here with an empty cart, bounce them back!
  if (cart.length === 0 && !isProcessing) {
    return (
      <div className="max-w-7xl mx-auto py-24 px-4 text-center">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-6">Your cart is empty</h2>
        <Link href="/" className="text-blue-600 font-medium hover:underline">
          Return to Shop &rarr;
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-10 tracking-tight">Checkout</h1>

      <div className="flex flex-col lg:flex-row gap-12 xl:gap-16">
        
        {/* LEFT COLUMN: The Checkout Form */}
        <div className="flex-1">
          <form onSubmit={handlePlaceOrder} className="space-y-8">
            
            {/* Contact Info */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Contact Information</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-600 outline-none transition-all" placeholder="you@example.com" />
              </div>
            </div>

            {/* NEW: Saved Addresses Selector (Only renders if they have saved addresses) */}
            {savedAddresses.length > 0 && (
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Saved Addresses</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {savedAddresses.map((addr, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => handleSelectAddress(addr)}
                      className={`cursor-pointer border p-4 rounded-xl relative transition-all ${
                        formData.address === addr.street 
                          ? "border-blue-600 bg-blue-50/50 ring-1 ring-blue-600" 
                          : "border-gray-200 hover:border-blue-300"
                      }`}
                    >
                      {addr.isDefault && <span className="absolute top-3 right-3 bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Default</span>}
                      <p className="text-sm font-medium text-gray-900">{addr.street}</p>
                      <p className="text-sm text-gray-600">{addr.city}, {addr.state} {addr.zipCode}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Shipping Address (Auto-fills if they click a saved address above) */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Shipping Address</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input required type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-600 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input required type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-600 outline-none transition-all" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                  <input required type="text" name="address" value={formData.address} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-600 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input required type="text" name="city" value={formData.city} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-600 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ZIP / Postal Code</label>
                  <input required type="text" name="zip" value={formData.zip} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-600 outline-none transition-all" />
                </div>
              </div>
            </div>

            {/* Payment Method (Simulation) */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Payment Details (Demo)</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                  <input required type="text" name="cardNumber" onChange={handleChange} placeholder="0000 0000 0000 0000" maxLength={19} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-600 outline-none transition-all font-mono" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Expiration (MM/YY)</label>
                    <input required type="text" name="expDate" onChange={handleChange} placeholder="12/25" maxLength={5} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-600 outline-none transition-all font-mono" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                    <input required type="text" name="cvv" onChange={handleChange} placeholder="123" maxLength={4} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-600 outline-none transition-all font-mono" />
                  </div>
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isProcessing}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-5 px-8 rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed text-lg"
            >
              {isProcessing ? "Processing Securely..." : `Pay $${finalTotal.toFixed(2)}`}
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN: Order Summary */}
        <div className="w-full lg:w-96 shrink-0">
          <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100 sticky top-24">
            <h2 className="text-xl font-extrabold text-gray-900 mb-6">Order Summary</h2>
            
            <ul className="space-y-4 mb-6 pb-6 border-b border-gray-200 max-h-[40vh] overflow-y-auto pr-2">
              {cart.map((item) => (
                <li key={item._id} className="flex items-center space-x-4">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md border border-gray-200 bg-white p-1">
                    <img src={item.imageUrl} alt={item.name} className="h-full w-full object-contain" />
                  </div>
                  <div className="flex flex-1 justify-between text-sm">
                    <div>
                      <h3 className="font-medium text-gray-900 line-clamp-1 pr-2">{item.name}</h3>
                      <p className="text-gray-500 mt-1">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-bold text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="space-y-3 text-sm font-medium text-gray-600 mb-6">
              <div className="flex justify-between">
                <p>Subtotal</p>
                <p className="text-gray-900">${cartTotal.toFixed(2)}</p>
              </div>
              <div className="flex justify-between">
                <p>Shipping</p>
                <p className={shippingCost === 0 ? "text-green-600 font-bold" : "text-gray-900"}>
                  {shippingCost === 0 ? "FREE" : `$${shippingCost.toFixed(2)}`}
                </p>
              </div>
            </div>

            <div className="flex justify-between items-end border-t border-gray-200 pt-6">
              <p className="text-lg font-bold text-gray-900">Total</p>
              <p className="text-3xl font-black text-gray-900">${finalTotal.toFixed(2)}</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}