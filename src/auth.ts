import NextAuth, { type DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectToDatabase } from "@/lib/mongodb";
import Admin from "@/models/Admin";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config"; // Import the edge config

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig, // Spread the edge config here
  providers: [
    // 1. ADMIN CREDENTIALS PROVIDER
    CredentialsProvider({
      id: "admin-credentials", 
      name: "Admin Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // 1. ADD THIS LOG TO DEBUG THE PAYLOAD
        console.log("---- INCOMING LOGIN PAYLOAD ----");
        console.log(credentials); 
        console.log("--------------------------------");

        // 2. Safely extract variables (Auth.js v5 sometimes wraps them weirdly)
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;

        if (!email || !password) {
          throw new Error(`Missing credentials. Received: ${JSON.stringify(credentials)}`);
        }

        await connectToDatabase();
        const admin = await Admin.findOne({ email });
        if (!admin) throw new Error("Invalid email or password");

        const isPasswordValid = await bcrypt.compare(password, admin.password);
        if (!isPasswordValid) throw new Error("Invalid email or password");

        return { id: admin._id.toString(), email: admin.email, name: "Store Admin", role: "admin" };
      },
    }),

    // 2. CUSTOMER CREDENTIALS PROVIDER
    CredentialsProvider({
      id: "customer-credentials", 
      name: "Customer Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) throw new Error("Missing credentials");

        await connectToDatabase();
        const customer = await User.findOne({ email: credentials.email });
        if (!customer) throw new Error("Invalid email or password");

        const isPasswordValid = await bcrypt.compare(credentials.password as string, customer.password);
        if (!isPasswordValid) throw new Error("Invalid email or password");

        return { id: customer._id.toString(), email: customer.email, name: customer.name, role: "customer" };
      },
    }),
  ],
});

// --- TYPESCRIPT MODULE AUGMENTATION ---
declare module "next-auth" {
  interface User {
    role?: string;
  }
  interface Session {
    user: {
      role?: string;
    } & DefaultSession["user"];
  }
  interface JWT {
    role?: string;
  }
}