import Link from "next/link";
import { connectToDatabase } from "@/lib/mongodb";
import BlogPost from "@/models/BlogPost";

export const metadata = {
  title: "Blog & Tech News | TechStore",
  description: "Read our latest tech guides, news, and product reviews.",
};

export default async function BlogGridPage() {
  await connectToDatabase();

  // 1. Fetch only PUBLISHED posts, newest first, excluding the heavy content
  const rawPosts = await BlogPost.find({ isPublished: true })
    .select("-content")
    .sort({ createdAt: -1 })
    .lean();

  // 2. Safely serialize Mongoose ObjectIds and Dates for Next.js Client Components
  const posts = rawPosts.map((post: any) => ({
    _id: post._id.toString(),
    title: post.title,
    slug: post.slug,
    category: post.category,
    excerpt: post.excerpt,
    coverImage: post.coverImage,
    author: post.author,
    // Format the native Mongoose Date into a readable string (e.g., "July 13, 2026")
    date: new Date(post.createdAt).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }),
  }));

  return (
    <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 mt-4">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
          TechStore Blog
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto">
          The latest product reviews, technical guides, and industry news from our team of tech experts.
        </p>
      </div>

      {posts.length === 0 ? (
        // The Empty State
        <div className="text-center py-24 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l6 6v10a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900">No articles yet</h3>
          <p className="mt-2 text-sm text-gray-500">
            Our team is currently writing some great content. Check back soon!
          </p>
        </div>
      ) : (
        // The Blog Grid
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {posts.map((post) => (
            <Link 
              key={post._id} 
              href={`/blogs/${post.slug}`}
              className="group flex flex-col bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              {/* Cover Image */}
              <div className="aspect-video bg-gray-100 overflow-hidden relative border-b border-gray-100">
                {post.coverImage ? (
                  <img 
                    src={post.coverImage} 
                    alt={post.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
                    <svg className="h-10 w-10 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                {/* Category Badge */}
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-blue-600 uppercase tracking-wider shadow-sm">
                  {post.category}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 flex flex-col grow">
                <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {post.title}
                </h2>
                <p className="text-gray-500 text-sm mb-6 line-clamp-3 leading-relaxed">
                  {post.excerpt}
                </p>

                {/* Card Footer (Pushed to bottom) */}
                <div className="mt-auto pt-5 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center font-medium text-gray-700">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-2 text-[10px] font-bold">
                      {post.author.charAt(0).toUpperCase()}
                    </span>
                    {post.author}
                  </div>
                  <time>{post.date}</time>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}