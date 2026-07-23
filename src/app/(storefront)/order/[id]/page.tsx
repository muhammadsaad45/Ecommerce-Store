import { connectToDatabase } from "@/lib/mongodb";
import Order from "@/models/Order";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Truck, PackageCheck, AlertCircle } from "lucide-react";

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

  // 1. DYNAMIC TRACKING LOGIC: Use a real tracking number if it exists, otherwise fall back to a placeholder
  const trackingNumber = order.trackingNumber || `TRK-${order.orderNumber}`;
  const status = order.status || "Processing";

  return (
    <div className="max-w-4xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
      
      {/* Success Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-6">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">Order Confirmed!</h1>
        <p className="text-lg text-gray-500">Thank you for your purchase, {order.customer.firstName}.</p>
      </div>

      {/* 2. NEW: VISUAL FULFILLMENT TIMELINE STEPPER */}
      <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-8 mb-8">
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6">Fulfillment Status</h2>
        <div className="relative flex items-center justify-between w-full max-w-xl mx-auto">
          {/* Progress Bar Background Line */}
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-gray-100 -z-10"></div>
          <div className={`absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-blue-600 -z-10 transition-all duration-500 ${
            status === "Delivered" ? "w-full" : status === "Shipped" ? "w-1/2" : "w-0"
          }`}></div>

          {/* Step 1: Processing */}
          <div className="flex flex-col items-center bg-white px-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
              status === "Processing" || status === "Shipped" || status === "Delivered"
                ? "bg-blue-600 border-blue-600 text-white" : "border-gray-300 bg-white text-gray-400"
            }`}>
              <AlertCircle className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-gray-600 mt-2">Processing</span>
          </div>

          {/* Step 2: Shipped */}
          <div className="flex flex-col items-center bg-white px-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
              status === "Shipped" || status === "Delivered"
                ? "bg-blue-600 border-blue-600 text-white" : "border-gray-300 bg-white text-gray-400"
            }`}>
              <Truck className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-gray-600 mt-2">Shipped</span>
          </div>

          {/* Step 3: Delivered */}
          <div className="flex flex-col items-center bg-white px-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
              status === "Delivered" ? "bg-blue-600 border-blue-600 text-white" : "border-gray-300 bg-white text-gray-400"
            }`}>
              <PackageCheck className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-gray-600 mt-2">Delivered</span>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
        
        {/* Order Meta Details */}
        <div className="bg-gray-50 border-b border-gray-100 p-8 grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
          <div>
            <p className="text-gray-500 font-medium mb-1">Order Number</p>
            <p className="font-bold text-gray-900 uppercase font-mono">{order.orderNumber.toString()}</p>
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
          
          {/* Shipping & Tracking Info */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-6 border-b border-gray-100 pb-2">Shipping Details</h2>
            
            <div className="bg-blue-50 text-blue-800 p-4 rounded-xl mb-6 border border-blue-100">
              <p className="font-bold text-xs uppercase tracking-wider mb-1 text-blue-600">Tracking Number</p>
              <p className="font-mono text-lg">{trackingNumber}</p>
              <p className="text-sm mt-2 opacity-80">
                {status === "Delivered" ? "Package successfully delivered!" : 
                 status === "Shipped" ? "In transit with logistics carrier." : 
                 "Currently processing in our warehouse."}
              </p>
            </div>

            <div className="text-gray-600 leading-relaxed text-sm">
              <p className="font-medium text-gray-900 text-base mb-1">{order.customer.firstName} {order.customer.lastName}</p>
              <p>{order.customer.address}</p>
              <p>{order.customer.city}, {order.customer.zip || order.customer.zipCode}</p> 
              <p className="mt-4 pt-4 border-t border-gray-100">{order.customer.email}</p>
            </div>
          </div>

          {/* Itemized Receipt */}
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
          className="text-blue-600 font-semibold hover:text-blue-700 hover:underline transition-all shadow-sm bg-white border border-gray-200 px-6 py-3 rounded-xl"
        >
          &larr; Continue Shopping
        </Link>
      </div>

    </div>
  );
}