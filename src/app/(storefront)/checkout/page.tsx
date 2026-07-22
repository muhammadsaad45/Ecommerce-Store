import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import CheckoutClient from "./CheckoutClient";

export default async function CheckoutPage() {
  // 1. Fetch the secure session on the server
  const session = await auth();
  
  let savedAddresses = [];
  let userProfile = null;

  // 2. If they are logged in, fetch their addresses from MongoDB
  if (session?.user?.email) {
    await connectToDatabase();
    
    // Fetch the user data
    const dbUser = await User.findOne({ email: session.user.email }).lean();
    
    if (dbUser) {
      // Stringify and parse to safely strip Mongoose ObjectIds before passing to Client
      savedAddresses = JSON.parse(JSON.stringify(dbUser.addresses || []));
      
      // Package basic user info
      userProfile = {
        name: session.user.name,
        email: session.user.email,
      };
    }
  }

  // 3. Render the client component, passing the data as props
  return (
    <CheckoutClient 
      user={userProfile} 
      savedAddresses={savedAddresses} 
    />
  );
}