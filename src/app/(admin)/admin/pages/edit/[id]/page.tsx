import { connectToDatabase } from "@/lib/mongodb";
import Page from "@/models/Page";
import { notFound } from "next/navigation";
import EditPageForm from "./EditPageForm";

// Handles the Next.js 15 dynamic params promise
type EditPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditPage({ params }: EditPageProps) {
  const resolvedParams = await params;
  
  await connectToDatabase();
  
  // Fetch the page by its ID
  const pageData = await Page.findById(resolvedParams.id).lean();

  if (!pageData) {
    notFound(); // Triggers a 404 page if the ID is invalid
  }

  // We stringify and parse the data to clean up MongoDB's complex _id object 
  // so it can be safely passed to a Client Component
  const cleanPageData = JSON.parse(JSON.stringify(pageData));

  return <EditPageForm pageData={cleanPageData} />;
}