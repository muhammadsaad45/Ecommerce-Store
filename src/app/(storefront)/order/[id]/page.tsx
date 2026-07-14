import { connectToDatabase } from "@/lib/mongodb";
import Order from "@/models/Order";
import Link from "next/link";
import { notFound } from "next/navigation";

// Define the expected Next.js 15 params structure
type OrderPageProps = {
  params: Promise<{ id: string }>;
};

export default async function OrderConfirmationPage({ params }: OrderPageProps) {
  const { id } = await params;

  await connectToDatabase();

  // Fetch the order by the custom short code instead of MongoDB Object ID
  const order = await Order.findOne({ orderNumber: id.toUpperCase() }).lean();

  if (!order) {
    return notFound();
  }

  // Use the orderNumber for the tracking number helper string too!
  const dummyTracking = `TRK-${order.orderNumber}`;

  return (
    <div className="max-w-4xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
      
      {/* 1. Success Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-6">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">Order Confirmed!</h1>
        <p className="text-lg text-gray-500">Thank you for your purchase, {order.customer.firstName}.</p>
      </div>

      <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
        
        {/* 2. Order Meta Details */}
        <div className="bg-gray-50 border-b border-gray-100 p-8 grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
          <div>
            <p className="text-gray-500 font-medium mb-1">Order Number</p>
            <p className="font-bold text-gray-900 uppercase">{order.orderNumber.toString()}</p>
          </div>
          <div>
            <p className="text-gray-500 font-medium mb-1">Date Placed</p>
            <p className="font-bold text-gray-900">
              {new Date(order.createdAt).toLocaleDateString('en-US', { 
                month: 'long', day: 'numeric', year: 'numeric' 
              })}
            </p>
          </div>
          <div>
            <p className="text-gray-500 font-medium mb-1">Total Amount</p>
            <p className="font-bold text-blue-600 text-lg">${order.total.toFixed(2)}</p>
          </div>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-12">
          
          {/* 3. Shipping & Tracking Info */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-6 border-b border-gray-100 pb-2">Shipping Details</h2>
            
            <div className="bg-blue-50 text-blue-800 p-4 rounded-xl mb-6 border border-blue-100">
              <p className="font-bold text-xs uppercase tracking-wider mb-1 text-blue-600">Tracking Number</p>
              <p className="font-mono text-lg">{dummyTracking}</p>
              <p className="text-sm mt-2 opacity-80">Currently processing in our warehouse.</p>
            </div>

            <div className="text-gray-600 leading-relaxed">
              <p className="font-medium text-gray-900">{order.customer.firstName} {order.customer.lastName}</p>
              <p>{order.customer.address}</p>
              <p>{order.customer.city}, {order.customer.zip}</p>
              <p className="mt-4 pt-4 border-t border-gray-100">{order.customer.email}</p>
            </div>
          </div>

          {/* 4. Itemized Receipt */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-6 border-b border-gray-100 pb-2">Order Summary</h2>
            <ul className="space-y-4 mb-6">
              {order.items.map((item: any, index: number) => (
                <li key={index} className="flex justify-between items-start text-sm">
                  <div className="pr-4">
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-gray-500 mt-0.5">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-medium text-gray-900 whitespace-nowrap">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </li>
              ))}
            </ul>

            <div className="space-y-2 text-sm text-gray-600 pt-4 border-t border-gray-100">
              <div className="flex justify-between">
                <p>Subtotal</p>
                <p>${order.subtotal.toFixed(2)}</p>
              </div>
              <div className="flex justify-between">
                <p>Shipping</p>
                <p>{order.shippingCost === 0 ? "FREE" : `$${order.shippingCost.toFixed(2)}`}</p>
              </div>
              <div className="flex justify-between items-center pt-4 mt-2 border-t border-gray-100 text-base font-bold text-gray-900">
                <p>Total Paid</p>
                <p>${order.total.toFixed(2)}</p>
              </div>
            </div>
          </div>

        </div>
      </div>

      <div className="text-center mt-12">
        <Link 
          href="/" 
          className="text-blue-600 font-semibold hover:text-blue-700 hover:underline transition-all"
        >
          &larr; Continue Shopping
        </Link>
      </div>

    </div>
  );
}