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

// Add this below your existing addAddress function in src/actions/profile.ts

export async function updateAddress(formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Unauthorized");

  const addressId = formData.get("addressId");
  const isDefault = formData.get("isDefault") === "on";

  await connectToDatabase();

  // If they are making this the new default, strip the default status from all others first
  if (isDefault) {
    await User.updateOne(
      { email: session.user.email, "addresses.0": { $exists: true } },
      { $set: { "addresses.$[].isDefault": false } }
    );
  }

  // Update the specific subdocument using the positional operator ($)
  await User.updateOne(
    { email: session.user.email, "addresses._id": addressId },
    {
      $set: {
        "addresses.$.street": formData.get("street"),
        "addresses.$.city": formData.get("city"),
        "addresses.$.state": formData.get("state"),
        "addresses.$.zipCode": formData.get("zipCode"),
        "addresses.$.country": formData.get("country") || "United States",
        "addresses.$.isDefault": isDefault,
      },
    }
  );

  revalidatePath("/profile");
  return { success: true };
}


export async function setDefaultAddress(addressId: string) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Unauthorized");

  await connectToDatabase();

  // Step 1: Remove the default flag from all existing addresses
  await User.updateOne(
    { email: session.user.email, "addresses.0": { $exists: true } },
    { $set: { "addresses.$[].isDefault": false } }
  );

  // Step 2: Apply the default flag to the newly selected address
  await User.updateOne(
    { email: session.user.email, "addresses._id": addressId },
    { $set: { "addresses.$.isDefault": true } }
  );

  revalidatePath("/profile");
  return { success: true };
}