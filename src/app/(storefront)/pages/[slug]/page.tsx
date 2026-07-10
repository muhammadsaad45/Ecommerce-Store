import { connectToDatabase } from "@/lib/mongodb";
import Page from "@/models/Page";
import { notFound } from "next/navigation";
import { Metadata } from "next";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  await connectToDatabase();
  const pageData = await Page.findOne({ slug: resolvedParams.slug }).lean();

  if (!pageData) return { title: "Page Not Found" };

  return {
    title: pageData.metaTitle || pageData.title,
    description: pageData.metaDescription || "Read more at TechStore",
  };
}

export default async function CustomStorefrontPage({ params, searchParams }: PageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  
  // Check if the URL has ?preview=true
  const isPreview = resolvedSearchParams.preview === "true";
  
  await connectToDatabase();
  
  // If preview mode is active, fetch the page regardless of status.
  // Otherwise, strictly enforce that it must be published.
  const query = isPreview 
    ? { slug: resolvedParams.slug } 
    : { slug: resolvedParams.slug, isPublished: true };

  const pageData = await Page.findOne(query).lean();

  if (!pageData) {
    notFound(); 
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 bg-white mt-10 rounded-2xl shadow-sm border border-gray-100">
      
      {/* Draft Mode Warning Banner */}
      {isPreview && !pageData.isPublished && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg mb-8 flex items-center justify-center font-medium text-sm">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          Preview Mode: This page is currently a draft and hidden from public customers.
        </div>
      )}

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