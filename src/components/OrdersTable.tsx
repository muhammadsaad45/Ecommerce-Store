"use client";

import { useState } from "react";

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

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setIsUpdating(orderId);

    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        // Update the local UI state so we don't have to refresh the page
        setOrders((prev) =>
          prev.map((order) =>
            order._id === orderId ? { ...order, status: newStatus } : order
          )
        );
      } else {
        alert("Failed to update status.");
      }
    } catch (error) {
      console.error(error);
      alert("Network error.");
    } finally {
      setIsUpdating(null);
    }
  };

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
        <h3 className="text-lg font-medium text-gray-900">No orders yet</h3>
        <p className="mt-1 text-sm text-gray-500">When customers place orders, they will appear here.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-sm font-semibold text-gray-600">
              <th className="p-4 pl-6">Order</th>
              <th className="p-4">Date</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Total</th>
              <th className="p-4 pr-6">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.map((order) => (
              <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                
                {/* Order Number */}
                <td className="p-4 pl-6 font-mono text-sm font-bold text-gray-900">
                  #{order.orderNumber}
                </td>
                
                {/* Date */}
                <td className="p-4 text-sm text-gray-500 whitespace-nowrap">
                  {new Date(order.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </td>
                
                {/* Customer Details */}
                <td className="p-4">
                  <p className="text-sm font-medium text-gray-900">
                    {order.customer.firstName} {order.customer.lastName}
                  </p>
                  <p className="text-xs text-gray-500">{order.customer.email}</p>
                </td>
                
                {/* Total */}
                <td className="p-4 text-sm font-bold text-gray-900">
                  ${order.total.toFixed(2)}
                </td>
                
                {/* Interactive Status Dropdown */}
                <td className="p-4 pr-6">
                  <div className="relative inline-block w-36">
                    <select
                      value={order.status}
                      disabled={isUpdating === order._id}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
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
                    {/* Custom Dropdown Arrow */}
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-current opacity-50">
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </td>
                
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}