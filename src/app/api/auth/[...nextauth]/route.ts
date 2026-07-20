import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectToDatabase } from "@/lib/mongodb";
import Admin from "@/models/Admin";
import bcrypt from "bcryptjs";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email;
        const password = credentials?.password;

        if (typeof email !== "string" || typeof password !== "string") {
          throw new Error("Missing credentials");
        }

        await connectToDatabase();

        // 1. Check if the admin exists
        const admin = await Admin.findOne({ email });
        if (!admin) {
          throw new Error("Invalid email or password");
        }

        // 2. Check if the password matches the hashed password in the DB
        const isPasswordValid = await bcrypt.compare(
          password,
          admin.password
        );

        if (!isPasswordValid) {
          throw new Error("Invalid email or password");
        }

        // 3. Return the user object if successful
        return { id: admin._id.toString(), email: admin.email };
      },
    }),
  ],
  session: {
    strategy: "jwt", // Use JSON Web Tokens for the session
  },
  pages: {
    signIn: "/admin/login", // Redirect here if a user isn't logged in
  },
});

export { handler as GET, handler as POST };