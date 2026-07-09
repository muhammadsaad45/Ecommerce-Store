import { connectToDatabase } from "@/lib/mongodb";
import Page from "@/models/Page";
import { notFound } from "next/navigation";
import { Metadata } from "next"; // Import Next.js Metadata type

type PageProps = {
  params: Promise<{ slug: string }>;
};

// 1. Next.js automatically runs this function to build the <head> tags for Google
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  await connectToDatabase();
  const pageData = await Page.findOne({ slug: resolvedParams.slug }).lean();

  if (!pageData) return { title: "Page Not Found" };

  // Prioritize the custom SEO title/description. If blank, fall back to the standard title.
  return {
    title: pageData.metaTitle || pageData.title,
    description: pageData.metaDescription || "Read more at TechStore",
  };
}

export default async function CustomStorefrontPage({ params }: PageProps) {
  const resolvedParams = await params;
  
  await connectToDatabase();
  const pageData = await Page.findOne({ 
    slug: resolvedParams.slug, 
    isPublished: true 
  }).lean();

  if (!pageData) {
    notFound(); 
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 bg-white mt-10 rounded-2xl shadow-sm border border-gray-100">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-8 tracking-tight border-b pb-6">
        {pageData.title}
      </h1>
      
      <div 
        className="prose prose-lg prose-blue max-w-none text-gray-700"
        dangerouslySetInnerHTML={{ __html: pageData.content }}
      />
    </div>
  );
}