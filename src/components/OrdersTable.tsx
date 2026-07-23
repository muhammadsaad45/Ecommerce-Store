"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, Truck, Package, MapPin } from "lucide-react";

const statusColors: Record<string, string> = {
  Pending: "bg-gray-100 text-gray-800 border-gray-200",
  Processing: "bg-yellow-50 text-yellow-800 border-yellow-200",
  Shipped: "bg-blue-50 text-blue-800 border-blue-200",
  Delivered: "bg-green-50 text-green-800 border-green-200",
  Cancelled: "bg-red-50 text-red-800 border-red-200",
};

export default function OrdersTable({ initialOrders }: { initialOrders: any[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [trackingInputs, setTrackingInputs] = useState<Record<string, string>>({});

  // 1. Toggles row expansion
  const toggleExpand = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  // 2. CRITICAL FIX: Dynamically evaluate the [orderId] variable key instead of the string literal "orderId"
  const handleTrackingInputChange = (orderId: string, value: string) => {
    setTrackingInputs((prev) => ({ ...prev, [orderId]: value }));
  };

  // 3. Submits status and tracking numbers to the backend
  const handleUpdateOrder = async (orderId: string, newStatus: string, customTracking?: string) => {
    setIsUpdating(orderId);
    const trackingToSubmit = customTracking ?? trackingInputs[orderId] ?? "";

    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          status: newStatus,
          trackingNumber: trackingToSubmit 
        }),
      });

      if (response.ok) {
        // THE FIX: Explicitly grab what we just sent to the database
        const updatedTrackingNumber = trackingToSubmit;

        setOrders((prev) =>
          prev.map((order) =>
            order._id === orderId 
              ? { 
                  ...order, 
                  status: newStatus, 
                  // Force the local state to take the new tracking number immediately
                  trackingNumber: updatedTrackingNumber 
                } 
              : order
          )
        );
        
        // Optional: Alert the operator that the parameters saved successfully
        console.log(`Order ${orderId} updated: Status = ${newStatus}, Tracking = ${updatedTrackingNumber}`);
      } else {
        alert("Failed to update order parameters.");
      }
    } catch (error) {
      console.error(error);
      alert("Network communication failure.");
    } finally {
      setIsUpdating(null);
    }
  };

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-black">
        <h3 className="text-lg font-medium text-gray-900">No orders yet</h3>
        <p className="mt-1 text-sm text-gray-500">When customers place orders, they will appear here.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden text-black">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-sm font-semibold text-gray-600">
              <th className="p-4 pl-6 w-10"></th>
              <th className="p-4">Order</th>
              <th className="p-4">Date</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Total</th>
              <th className="p-4 pr-6">Status / Fulfillment</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.map((order) => {
              const isExpanded = expandedOrder === order._id;
              
              // CRITICAL FIX: Wrapped with React.Fragment instead of <caption> to solve browser validation rules
              return (
                <React.Fragment key={order._id}>
                  {/* MAIN ORDER ROW */}
                  <tr className="hover:bg-gray-50/80 transition-colors cursor-pointer" onClick={() => toggleExpand(order._id)}>
                    <td className="p-4 pl-6">
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </td>
                    <td className="p-4 font-mono text-sm font-bold text-gray-900">
                      #{order.orderNumber}
                    </td>
                    <td className="p-4 text-sm text-gray-500 whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        month: "short", day: "numeric", year: "numeric",
                      })}
                    </td>
                    <td className="p-4">
                      <p className="text-sm font-medium text-gray-900">{order.customer.firstName} {order.customer.lastName}</p>
                      <p className="text-xs text-gray-500">{order.customer.email}</p>
                    </td>
                    <td className="p-4 text-sm font-bold text-gray-900">
                      ${order.total.toFixed(2)}
                    </td>
                    
                    {/* Status Select Column */}
                    <td className="p-4 pr-6" onClick={(e) => e.stopPropagation()}>
                      <div className="relative inline-block w-36">
                        <select
                          value={order.status}
                          disabled={isUpdating === order._id}
                          onChange={(e) => handleUpdateOrder(order._id, e.target.value)}
                          className={`appearance-none w-full border text-xs font-bold px-3 py-1.5 rounded-full outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer ${
                            statusColors[order.status]
                          } ${isUpdating === order._id ? "opacity-50 cursor-wait" : ""}`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-current opacity-50">
                          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </td>
                  </tr>

                  {/* EXPANDABLE DETAILS DRAWER */}
                  {isExpanded && (
                    <tr className="bg-gray-50/50">
                      <td colSpan={6} className="p-6 border-b border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
                          
                          {/* Left Column: Item List */}
                          <div className="md:col-span-1 space-y-3">
                            <h4 className="font-bold text-gray-700 flex items-center gap-1.5 uppercase text-xs tracking-wider">
                              <Package className="w-4 h-4 text-gray-400" /> Items Summary
                            </h4>
                            <div className="bg-white border border-gray-100 rounded-xl p-4 space-y-2 shadow-sm">
                              {order.items?.map((item: any, idx: number) => (
                                <div key={idx} className="flex justify-between items-center text-xs text-gray-600">
                                  <span><strong className="text-gray-900 font-medium">{item.quantity}x</strong> {item.name}</span>
                                  <span className="font-semibold text-gray-900">${(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Center Column: Destination */}
                          <div className="md:col-span-1 space-y-3">
                            <h4 className="font-bold text-gray-700 flex items-center gap-1.5 uppercase text-xs tracking-wider">
                              <MapPin className="w-4 h-4 text-gray-400" /> Destination
                            </h4>
                            <div className="bg-white border border-gray-100 rounded-xl p-4 text-xs text-gray-600 shadow-sm leading-relaxed">
                              <p className="font-semibold text-gray-900 mb-1">{order.customer.firstName} {order.customer.lastName}</p>
                              <p>{order.customer.address}</p>
                              <p>{order.customer.city}, {order.customer.zip || order.customer.zipCode}</p>
                            </div>
                          </div>

                          {/* Right Column: Tracking Configuration */}
                          <div className="md:col-span-1 space-y-3">
                            <h4 className="font-bold text-gray-700 flex items-center gap-1.5 uppercase text-xs tracking-wider">
                              <Truck className="w-4 h-4 text-gray-400" /> Logistics Fulfillment
                            </h4>
                            <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm space-y-3">
                              {order.status === "Shipped" || order.trackingNumber ? (
                                <div>
                                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Active Tracking Reference</label>
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="text"
                                      placeholder="Update tracking number..."
                                      defaultValue={order.trackingNumber || ""}
                                      onChange={(e) => handleTrackingInputChange(order._id, e.target.value)}
                                      className="flex-1 text-xs border border-gray-200 px-3 py-1.5 rounded-lg outline-none focus:border-blue-500 bg-white text-black"
                                    />
                                    <button 
                                      onClick={() => handleUpdateOrder(order._id, order.status)}
                                      disabled={isUpdating === order._id}
                                      className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg font-medium transition-colors"
                                    >
                                      Save
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="text-center py-2 text-gray-400 text-xs">
                                  Set order status to <span className="font-bold text-blue-600">"Shipped"</span> to input custom transit variables.
                                </div>
                              )}
                            </div>
                          </div>

                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}