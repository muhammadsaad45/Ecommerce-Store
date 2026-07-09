import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Page from "@/models/Page";

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();

    // Basic validation to ensure the slug doesn't already exist
    const existingPage = await Page.findOne({ slug: body.slug });
    if (existingPage) {
      return NextResponse.json(
        { error: "A page with this slug already exists." },
        { status: 400 }
      );
    }

    const newPage = await Page.create(body);
    return NextResponse.json(newPage, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/pages Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// Add this below your existing POST function
export async function DELETE(request: Request) {
  try {
    await connectToDatabase();
    
    // Extract the ID from the URL (e.g., /api/pages?id=123)
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Page ID is required" }, { status: 400 });
    }

    const deletedPage = await Page.findByIdAndDelete(id);
    
    if (!deletedPage) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Page deleted successfully" }, { status: 200 });
  } catch (error: any) {
    console.error("DELETE /api/pages Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
export async function PUT(request: Request) {
  try {
    await connectToDatabase(); // Or connectToDatabase() depending on how you imported it!
    const body = await request.json();
    
    // Extract the ID from the body, and keep the rest of the data to update
    const { _id, ...updateData } = body;

    if (!_id) {
      return NextResponse.json({ error: "Page ID is required" }, { status: 400 });
    }

    // Find the page by ID and update it. { new: true } returns the updated document.
    const updatedPage = await Page.findByIdAndUpdate(_id, updateData, { new: true });
    
    if (!updatedPage) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    return NextResponse.json(updatedPage, { status: 200 });
  } catch (error: any) {
    console.error("PUT /api/pages Error:", error);
    
    // Catch duplicate slug errors specifically
    if (error.code === 11000) {
      return NextResponse.json({ error: "A page with this slug already exists." }, { status: 400 });
    }
    
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}