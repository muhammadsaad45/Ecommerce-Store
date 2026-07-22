import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { NextResponse } from "next/server";

// Initialize NextAuth with ONLY the edge-safe configuration
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isAdmin = req.auth?.user?.role === "admin"; 
  
  const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");

  // Allow the login page itself to be accessed!
  if (req.nextUrl.pathname === "/admin/login") {
    return NextResponse.next();
  }

  // Protect Admin Routes
  if (isAdminRoute && (!isLoggedIn || !isAdmin)) {
    return NextResponse.redirect(new URL("/admin/login", req.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*"],
};