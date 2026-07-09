"use client"; // This tells Next.js this is an interactive client-side component

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation"; // Import the useRouter hook

export default function AdminLogin() {
  // State to hold our form data
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); 
  const router = useRouter(); 
  // Function to handle the form submission
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevents the page from refreshing
    setError(""); // Reset error message
    
    const result = await signIn("credentials", {
        redirect: false, // Prevents automatic redirection
        email,
        password,
      });

      if (result?.error) {
        setError("Invalid email or password"); // Display the error message
      }
      else {
        router.push("/admin/"); // Redirect to the dashboard on successful login
        router.refresh(); // Refresh the page to update the session state
      }
    };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Admin Access
        </h1>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black"
              required
            />
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}