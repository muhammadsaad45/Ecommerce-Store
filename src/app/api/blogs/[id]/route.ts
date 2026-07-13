import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import BlogPost from "@/models/BlogPost";
import { revalidatePath } from "next/cache";

// 1. GET a single blog for the Edit form
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await connectToDatabase();
    const post = await BlogPost.findById(id);
    
    if (!post) {
      return NextResponse.json({ error: "Blog post not found" }, { status: 404 });
    }
    return NextResponse.json(post, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// 2. PUT (Update) an existing blog
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await connectToDatabase();
    const body = await request.json();

    const updatedPost = await BlogPost.findByIdAndUpdate(id, body, { new: true });
    
    if (!updatedPost) {
      return NextResponse.json({ error: "Blog post not found" }, { status: 404 });
    }

    // Bust the cache for both the main grid and the specific article
    revalidatePath("/blogs");
    revalidatePath(`/blogs/${updatedPost.slug}`);
    
    return NextResponse.json(updatedPost, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// 3. DELETE a blog
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await connectToDatabase();
    
    const deletedPost = await BlogPost.findByIdAndDelete(id);
    
    if (!deletedPost) {
      return NextResponse.json({ error: "Blog post not found" }, { status: 404 });
    }

    revalidatePath("/blogs");
    return NextResponse.json({ message: "Blog post deleted successfully" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}