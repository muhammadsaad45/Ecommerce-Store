import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import { connectToDatabase } from "@/lib/mongodb";
import Order from "@/models/Order";
import User from "@/models/User";
import Link from "next/link";
import { Package, User as UserIcon, Mail, MapPin, CreditCard, LogOut, Calendar, Plus } from "lucide-react";
import AddressBook from "@/components/profile/AddressBook";

interface UserOrder {
  _id: any;
  orderNumber?: string;
  total: number;
  status: string;
  createdAt: string | Date;
  items: Array<{ name: string; quantity: number; price: number }>;
}

// Next.js 16 layouts parse URL search params straight into Server Components
export default async function AdvancedProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  // Await the searchParams mapping out native tabs
  const resolvedParams = await searchParams;
  const activeTab = resolvedParams.tab || "orders";

  await connectToDatabase();
  
  // Fetch detailed account context along with orders
  const dbUser = await User.findOne({ email: session.user.email }).lean();
  const userOrders: UserOrder[] = await Order.find({ "customer.email": session.user.email })
    .sort({ createdAt: -1 })
    .lean();

  // Safely strip away Mongoose ObjectId formatting by stringifying and parsing
const savedAddresses = JSON.parse(JSON.stringify(dbUser?.addresses || []));

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      
      {/* Upper Account Masthead */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-gray-200 pb-8 mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight capitalize">Hello, {session.user.name}</h1>
          <p className="text-gray-500 text-sm mt-1">Manage addresses, payment methods, and view past and current orders.</p>
        </div>
        <form action={async () => { "use server"; await signOut({ redirectTo: "/" }); }}>
          <button type="submit" className="flex items-center gap-2 py-2 px-4 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors">
            <LogOut className="w-4 h-4 text-gray-400" />
            Sign Out
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Column: Side Navigation Tabs */}
        <aside className="lg:col-span-1 space-y-2">
          <Link
            href="/profile?tab=orders"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              activeTab === "orders" ? "bg-blue-600 text-white shadow-sm font-semibold" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Package className="w-4 h-4" />
            Order History
          </Link>
          <Link
            href="/profile?tab=addresses"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              activeTab === "addresses" ? "bg-blue-600 text-white shadow-sm font-semibold" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <MapPin className="w-4 h-4" />
            Saved Addresses
          </Link>
          <Link
            href="/profile?tab=payment"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              activeTab === "payment" ? "bg-blue-600 text-white shadow-sm font-semibold" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <CreditCard className="w-4 h-4" />
            Payment Methods
          </Link>
        </aside>

        {/* Right Column: Tab Content Windows */}
        <main className="lg:col-span-3 min-h-100">
          
          {/* TAB 1: ORDER LOGS */}
          {/* TAB 1: ORDER LOGS */}
          {activeTab === "orders" && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
              <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">Your Orders</h3>
              {userOrders.length === 0 ? (
                <p className="text-gray-500 text-sm py-8 text-center">No orders linked to this account profile.</p>
              ) : (
                <div className="space-y-4">
                  {userOrders.map((order: any) => (
                    <div key={order._id.toString()} className="border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-all">
                      
                      {/* Header Row: Reference, Tracking, and Status */}
                      <div className="flex flex-wrap justify-between items-start border-b border-gray-100 pb-3 mb-3 gap-4">
                        
                        <div className="flex flex-wrap gap-8">
                          <div>
                            <span className="text-xs font-bold text-gray-400 block uppercase">Order Reference</span>
                            <span className="font-mono text-sm text-gray-800">{order.orderNumber || order._id.toString().slice(-8).toUpperCase()}</span>
                          </div>
                          
                          {/* NEW: Tracking Number Display */}
                          {(order.trackingNumber || order.status === "Shipped" || order.status === "Delivered") && (
                            <div>
                              <span className="text-xs font-bold text-gray-400 block uppercase">Tracking Number</span>
                              <span className="font-mono text-sm font-medium text-blue-600">
                                {order.trackingNumber || "Pending Logistics"}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        {/* Enhanced Status Badge */}
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${
                          order.status === "Delivered" ? "bg-green-50 text-green-700 border-green-200" : 
                          order.status === "Shipped" ? "bg-blue-50 text-blue-700 border-blue-200" :
                          order.status === "Cancelled" ? "bg-red-50 text-red-700 border-red-200" :
                          "bg-orange-50 text-orange-700 border-orange-200"
                        }`}>
                          {order.status || "Processing"}
                        </span>
                      </div>
                      
                      {/* Items List */}
                      <div className="space-y-2 text-sm text-gray-600">
                        {order.items?.map((item: any, idx: number) => (
                          <div key={idx} className="flex justify-between">
                            <span>{item.quantity}x {item.name}</span>
                            <span className="font-medium text-gray-900">${(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>

                      {/* Link to the dynamic visual timeline page */}
                      <div className="mt-4 pt-3 border-t border-gray-50 text-right">
                        <Link href={`/order/${order.orderNumber}`} className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                          View full receipt & tracking &rarr;
                        </Link>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ADDRESS MANAGEMENT */}
          {activeTab === "addresses" && (
             <AddressBook savedAddresses={savedAddresses} userName={session.user.name as string} />
          )}

          {/* TAB 3: SECURE PAYMENT PLATFORM INFO */}
          {activeTab === "payment" && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
              <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">Payment Methods</h3>
              
              {/* Educational compliance warning explaining payment design patterns */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-800 text-sm leading-relaxed">
                <strong>PCI-DSS Compliance Notice:</strong> To ensure high security, full credit card parameters are handled directly at the checkout layer via vaulted payment networks (Stripe/PayPal tokens) and are never permanently cached inside this cluster.
              </div>

              <div className="border border-dashed border-gray-200 rounded-xl p-8 text-center">
                <CreditCard className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500 font-medium">No saved cards linked.</p>
                <p className="text-xs text-gray-400 mt-0.5">Cards can be vaulted during your next checkout checkout sequence.</p>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}