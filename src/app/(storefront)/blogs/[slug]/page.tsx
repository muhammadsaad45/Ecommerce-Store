import { connectToDatabase } from "@/lib/mongodb";
import BlogPost from "@/models/BlogPost";
import Link from "next/link";
import { notFound } from "next/navigation";

// 1. Dynamic SEO Metadata Generation
export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
}) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const isPreview = resolvedSearchParams.preview === "true";

  await connectToDatabase();
  const post = await BlogPost.findOne(isPreview ? { slug } : { slug, isPublished: true }).lean();

  if (!post) {
    return { title: "Blog Not Found | TechStore" };
  }

  return {
    title: `${post.title} | TechStore Blog`,
    description: post.excerpt,
    openGraph: {
      images: [post.coverImage || "/default-blog-cover.jpg"],
    },
  };
}

// 2. The Main Page Component
export default async function BlogPostPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
}) {
  // Safely unwrap the Next.js Promise params
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const isPreview = resolvedSearchParams.preview === "true";
  
  await connectToDatabase();
  
  // Find the exact post by its URL slug
  const rawPost = await BlogPost.findOne(isPreview ? { slug } : { slug, isPublished: true }).lean();

  // If someone types in a bad URL or the post isn't published yet, show the Next.js 404 page
  if (!rawPost) {
    notFound();
  }

  // Safely serialize the Mongoose document
  const post = {
    ...rawPost,
    _id: rawPost._id.toString(),
    date: new Date(rawPost.createdAt).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }),
  };

  return (
    <article className="max-w-4xl mx-auto py-16 px-4 sm:px-6 lg:px-8 mt-4">
      {isPreview && !rawPost.isPublished && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg mb-8 flex items-center justify-center font-medium text-sm">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          Preview Mode: This blog post is currently a draft and hidden from public customers.
        </div>
      )}
      
      {/* Breadcrumb Navigation */}
      <nav className="mb-8 flex items-center text-sm font-medium text-gray-500">
        <Link href="/blogs" className="hover:text-blue-600 transition-colors">Blogs</Link>
        <span className="mx-2">&rsaquo;</span>
        <span className="text-gray-900">{post.category}</span>
      </nav>

      {/* Article Header */}
      <header className="mb-12 text-center">
        <div className="inline-block bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide mb-6">
          {post.category}
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight mb-6 leading-tight">
          {post.title}
        </h1>
        
        <div className="flex items-center justify-center text-gray-500 space-x-4">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center mr-3 font-bold text-sm border border-gray-300">
              {post.author.charAt(0).toUpperCase()}
            </div>
            <span className="font-medium text-gray-900">{post.author}</span>
          </div>
          <span>&bull;</span>
          <time>{post.date}</time>
        </div>
      </header>

      {/* Hero Cover Image */}
      {post.coverImage && (
        <div className="mb-12 aspect:21/9 w-full rounded-2xl overflow-hidden shadow-lg border border-gray-100">
          <img 
            src={post.coverImage} 
            alt={`Cover image for ${post.title}`} 
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* The Actual Rich-Text Content */}
      {/* Security Note: 'dangerouslySetInnerHTML' is required to render HTML tags saved from a rich-text editor. 
        Because you are the only one writing blogs from a secure admin panel, this is safe. 
        Never do this with public user comments! 
      */}
      <div 
        className="prose prose-lg prose-blue mx-auto text-gray-700 leading-relaxed max-w-none
          prose-headings:font-bold prose-headings:text-gray-900 
          prose-a:text-blue-600 hover:prose-a:text-blue-800
          prose-img:rounded-xl prose-img:shadow-md"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
      
      {/* Bottom Footer / Back Button */}
      <div className="mt-16 pt-8 border-t border-gray-200 text-center">
        <Link 
          href="/blogs" 
          className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
        >
          &larr; Read more articles
        </Link>
      </div>
      
    </article>
  );
}