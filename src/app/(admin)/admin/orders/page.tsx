import { connectToDatabase } from "@/lib/mongodb";
import Order from "@/models/Order";
import OrdersTable from "@/components/OrdersTable";

// Force Next.js to fetch fresh orders every time you load this page
export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  await connectToDatabase();

  // Fetch all orders, sorting by newest first
  const rawOrders = await Order.find().sort({ createdAt: -1 }).lean();

  // Next.js requires server data to be serialized before passing to Client Components
  const serializedOrders = rawOrders.map((order: any) => ({
    _id: order._id.toString(),
    orderNumber: order.orderNumber,
    customer: order.customer,
    total: order.total,
    status: order.status,
    createdAt: order.createdAt.toISOString(),
  }));

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="mb-8 flex justify-between items-end border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Order Management</h1>
          <p className="text-gray-500 mt-2 text-sm">
            Track customer purchases, update fulfillment statuses, and manage your pipeline.
          </p>
        </div>
      </div>
      
      <OrdersTable initialOrders={serializedOrders} />
    </div>
  );
}