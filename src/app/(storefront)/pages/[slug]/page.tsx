import { connectToDatabase } from "@/lib/mongodb";
import Page from "@/models/Page";
import { notFound } from "next/navigation";

// Required for Next.js 15 dynamic routing
type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function CustomStorefrontPage({ params }: PageProps) {
  // 1. Await the dynamic slug from the URL
  const resolvedParams = await params;
  
  // 2. Fetch the specific page from the database
  await connectToDatabase();
  const pageData = await Page.findOne({ 
    slug: resolvedParams.slug, 
    isPublished: true 
  }).lean();

  // 3. If the admin deleted the page or it's a typo, show a 404
  if (!pageData) {
    notFound(); 
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 bg-white mt-10 rounded-2xl shadow-sm border border-gray-100">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-8 tracking-tight border-b pb-6">
        {pageData.title}
      </h1>
      
      {/* 4. dangerouslySetInnerHTML tells React it is safe to render raw HTML here */}
      <div 
        className="prose prose-lg prose-blue max-w-none text-gray-700"
        dangerouslySetInnerHTML={{ __html: pageData.content }}
      />
    </div>
  );
}