export default function AdminDashboard() {
  return (
    <div className="p-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome to your store's control panel.</p>
      </div>
      
      {/* Placeholder Grid for Future Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Sales</h3>
          <p className="text-3xl font-bold text-gray-800 mt-2">$0.00</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Active Products</h3>
          <p className="text-3xl font-bold text-gray-800 mt-2">0</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Pending Orders</h3>
          <p className="text-3xl font-bold text-gray-800 mt-2">0</p>
        </div>
      </div>
    </div>
  );
}