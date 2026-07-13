import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import BlogPost from "@/models/BlogPost";
import { revalidatePath } from "next/cache";

// 1. GET: Fetch all blogs for the Admin Dashboard list
export async function GET() {
  try {
    await connectToDatabase();
    
    // Sort by newest created first, pulling everything except heavy content for performance
    const posts = await BlogPost.find({})
      .select("-content")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(posts, { status: 200 });
  } catch (error: any) {
    console.error("GET /api/blogs Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// 2. POST: Create a brand new blog post from the Admin Dashboard
export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();

    // Basic validation to ensure unique slugs
    if (!body.slug) {
      return NextResponse.json(
        { error: "A URL slug is required." },
        { status: 400 }
      );
    }

    const existingPost = await BlogPost.findOne({ slug: body.slug });
    if (existingPost) {
      return NextResponse.json(
        { error: "A blog post with this slug already exists." },
        { status: 400 }
      );
    }

    // Save the raw body data directly using our clean schema structure
    const newPost = await BlogPost.create(body);

    // Cache Buster: Instantly revalidate the storefront blogs listing
    revalidatePath("/blogs");
    
    return NextResponse.json(newPost, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/blogs Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}