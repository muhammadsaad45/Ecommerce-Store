import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isAdmin = req.auth?.user?.role === "admin"; 
  
  const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");
  const isProfileRoute = req.nextUrl.pathname.startsWith("/profile");

  // Allow the admin login page itself to be accessed
  if (req.nextUrl.pathname === "/admin/login") {
    return NextResponse.next();
  }

  // 1. Protect Admin Routes
  if (isAdminRoute && (!isLoggedIn || !isAdmin)) {
    return NextResponse.redirect(new URL("/admin/login", req.nextUrl));
  }

  // 2. Protect Customer Profile Routes (Send unauthenticated users to the new login page)
  if (isProfileRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  // Add /profile to the matcher array so the proxy actively watches it
  matcher: ["/admin/:path*", "/profile/:path*"],
};