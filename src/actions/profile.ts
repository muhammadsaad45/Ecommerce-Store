"use server";

import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import { revalidatePath } from "next/cache";

export async function addAddress(formData: FormData) {
  // 1. Verify the user is securely logged in
  const session = await auth();
  if (!session?.user?.email) throw new Error("Unauthorized");

  // 2. Extract data from the form
  const newAddress = {
    street: formData.get("street"),
    city: formData.get("city"),
    state: formData.get("state"),
    zipCode: formData.get("zipCode"),
    country: formData.get("country") || "United States",
    isDefault: formData.get("isDefault") === "on", // HTML checkboxes return "on" when checked
  };

  await connectToDatabase();

  // 3. Optional Pro-Tip: If they set this as default, unset all their other defaults first
 if (newAddress.isDefault) {
    await User.updateOne(
      { 
        email: session.user.email,
        "addresses.0": { $exists: true } // Tells Mongo: "Only do this if the first array item exists"
      },
      { $set: { "addresses.$[].isDefault": false } }
    );
  }

  // 4. Push the new address to the array
  await User.updateOne(
    { email: session.user.email },
    { $push: { addresses: newAddress } }
  );

  // 5. Instantly clear the cache for the profile page so the UI updates
  revalidatePath("/profile");
  
  return { success: true };
}