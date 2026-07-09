import mongoose from "mongoose";

const pageSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    content: { type: String, required: true }, // This will store the HTML
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Page = mongoose.models.Page || mongoose.model("Page", pageSchema);
export default Page;