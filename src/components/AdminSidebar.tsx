"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";

export default function AdminSidebar() {
  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen flex flex-col shadow-xl">
      {/* Brand Header */}
      <div className="h-20 flex items-center justify-center border-b border-gray-800">
        <h2 className="text-2xl font-bold tracking-wider">STORE<span className="text-blue-500">ADMIN</span></h2>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        <Link 
          href="/admin" 
          className="block px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors"
        >
          Dashboard
        </Link>
        <Link 
          href="/admin/products" 
          className="block px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors"
        >
          Products
        </Link>
        <Link 
          href="/admin/orders" 
          className="block px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors"
        >
          Orders
        </Link>
      </nav>

      {/* Bottom Action Area */}
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={() => signOut({ callbackUrl: '/admin/login' })}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
}