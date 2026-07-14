import { Metadata } from "next";
import ContactForm from "./ContactForm";

// 1. Next.js can safely resolve this on the server
export const metadata: Metadata = {
  title: "Contact Us | TechStore",
  description: "Get in touch with our customer support team for any questions or assistance you may need.",
};

// 2. This is a Server Component (Notice: NO "use client" at the top!)
export default function ContactPage() {
  return (
    <div className="max-w-xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
      <div className="bg-white p-8 sm:p-10 rounded-3xl border border-gray-100 shadow-sm">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">Contact Us</h1>
        <p className="text-gray-500 mb-8">
          Have a question about an order? Send us a message and we'll reply within 2 hours.
        </p>

        {/* 3. Mount the interactive form */}
        <ContactForm />
      </div>
    </div>
  );
}