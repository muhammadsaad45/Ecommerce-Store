export default function OrdersPage() {
  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Orders</h1>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <p className="text-gray-500 text-center py-10">No pending orders to display.</p>
      </div>
    </div>
  );
}