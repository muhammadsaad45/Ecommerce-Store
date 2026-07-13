import mongoose, { Schema, model, models } from "mongoose";

const blogPostSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide a blog title"],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, "Please provide a URL slug"],
      unique: true,
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Please provide a category (e.g., Tech News, Guides)"],
      trim: true,
    },
    excerpt: {
      type: String,
      required: [true, "Please provide a short excerpt for the blog grid"],
      maxLength: [300, "Excerpt cannot exceed 300 characters"],
    },
    content: {
      type: String, // This will hold your rich-text HTML from the editor
      required: [true, "Please provide the blog content"],
    },
    coverImage: {
      type: String, // URL from Cloudinary
      required: false,
    },
    author: {
      type: String,
      default: "TechStore Team",
    },
    isPublished: {
      type: Boolean,
      default: false, // Default to draft mode so you can work on them safely
    },
  },
  {
    timestamps: true, // Automatically handles 'createdAt' (publish date) and 'updatedAt'
  }
);

// Cache-busting line for Next.js development (just like we did for Products!)
delete mongoose.models.BlogPost;

const BlogPost = models.BlogPost || model("BlogPost", blogPostSchema);

export default BlogPost;