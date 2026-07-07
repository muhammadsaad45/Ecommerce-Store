"use client";

import { signOut } from "next-auth/react";

export default function AdminDashboard() {
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome to your store's control panel.</p>
        </div>
        
        {/* The Logout Button */}
        <button
          onClick={() => signOut({ callbackUrl: '/admin/login' })}
          className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md shadow-sm transition-colors"
        >
          Sign Out
        </button>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Stats</h2>
        <p className="text-gray-600">Your store analytics and products will appear here.</p>
      </div>
    </div>
  );
}