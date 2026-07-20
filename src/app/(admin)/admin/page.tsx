"use client";

import { useEffect, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { DollarSign, ShoppingBag, AlertTriangle, Layers, TrendingUp } from "lucide-react";

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch("/api/admin/analytics");
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Error loading analytics:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return <div className="p-10 text-center text-gray-500 animate-pulse">Loading business intelligence matrix...</div>;
  }

  const { kpis, salesOverTime, categorySales } = data;

  return (
    <div className="p-10 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome to your store's control panel. Here is your real-time performance analytics.</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Gross Revenue */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Gross Revenue</span>
            <p className="text-3xl font-bold text-gray-800">${kpis.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="p-3 bg-green-50 text-green-600 rounded-xl"><DollarSign className="w-6 h-6" /></div>
        </div>

        {/* Orders Processed */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Orders Processed</span>
            <p className="text-3xl font-bold text-gray-800">{kpis.totalOrders}</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><ShoppingBag className="w-6 h-6" /></div>
        </div>

        {/* Live Inventory */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Active Catalog</span>
            <p className="text-3xl font-bold text-gray-800">{kpis.totalProducts} Items</p>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl"><Layers className="w-6 h-6" /></div>
        </div>

        {/* Low Stock Warning */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Low Stock Alerts</span>
            <p className="text-3xl font-bold text-red-600">{kpis.lowStockCount} Products</p>
          </div>
          <div className="p-3 bg-red-50 text-red-600 rounded-xl"><AlertTriangle className="w-6 h-6" /></div>
        </div>
      </div>

      {/* Chart Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Revenue Area Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-50 pb-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-gray-800 text-base">Weekly Revenue Velocity</h3>
          </div>
          <div className="w-full h-80 text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesOverTime} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="date" tickLine={false} stroke="#9ca3af" />
                <YAxis tickLine={false} stroke="#9ca3af" />
                <Tooltip />
                <Area type="monotone" dataKey="Revenue" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Bar Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-50 pb-2">
            <Layers className="w-5 h-5 text-purple-600" />
            <h3 className="font-bold text-gray-800 text-base">Sales by Segment</h3>
          </div>
          <div className="w-full h-80 text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categorySales} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" tickLine={false} stroke="#9ca3af" />
                <YAxis tickLine={false} stroke="#9ca3af" />
                <Tooltip />
                <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Sales ($)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}