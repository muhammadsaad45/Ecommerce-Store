"use client";

import { useState } from "react";
import { Plus, X, Edit2, CheckCircle2 } from "lucide-react";
import { addAddress, updateAddress, setDefaultAddress } from "@/actions/profile";

export default function AddressBook({ savedAddresses, userName }: { savedAddresses: any[], userName: string }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  
  // Tracks which address we are currently editing. If null, we are adding a new one.
  const [editingAddress, setEditingAddress] = useState<any>(null);

  // Opens modal in "Add" mode
  const handleAddNew = () => {
    setEditingAddress(null);
    setIsModalOpen(true);
  };

  // Opens modal in "Edit" mode pre-filled with data
  const handleEdit = (addr: any) => {
    setEditingAddress(addr);
    setIsModalOpen(true);
  };

  // Handles both Add and Edit form submissions
  async function handleAction(formData: FormData) {
    setIsPending(true);
    
    if (editingAddress) {
      await updateAddress(formData);
    } else {
      await addAddress(formData);
    }
    
    setIsPending(false);
    setIsModalOpen(false);
  }

  // Quick action to swap the default address without opening the modal
  async function handleSetDefault(addressId: string) {
    setUpdatingId(addressId);
    await setDefaultAddress(addressId);
    setUpdatingId(null);
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6 relative">
      <div className="flex justify-between items-center border-b border-gray-100 pb-3">
        <h3 className="text-lg font-bold text-gray-900">Saved Addresses</h3>
        <button 
          onClick={handleAddNew}
          className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 border border-blue-200 hover:border-blue-300 px-3 py-1.5 rounded-lg transition-all"
        >
          <Plus className="w-3.5 h-3.5" /> Add Address
        </button>
      </div>
      
      {savedAddresses.length === 0 ? (
        <p className="text-gray-500 text-sm py-8 text-center">No shipping profiles saved to this directory.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {savedAddresses.map((addr: any, idx: number) => (
            <div key={addr._id || idx} className="border border-gray-200 p-5 rounded-xl relative hover:border-gray-300 transition-all flex flex-col justify-between h-full">
              
              <div>
                {addr.isDefault && <span className="absolute top-4 right-4 bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Default</span>}
                <p className="font-bold text-gray-900 text-sm mb-2">{userName}</p>
                <p className="text-sm text-gray-600">{addr.street}</p>
                <p className="text-sm text-gray-600">{addr.city}, {addr.state} {addr.zipCode}</p>
                <p className="text-xs text-gray-400 mt-1">{addr.country}</p>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                <button 
                  onClick={() => handleEdit(addr)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-blue-600 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit
                </button>
                
                {!addr.isDefault && (
                  <button 
                    onClick={() => handleSetDefault(addr._id)}
                    disabled={updatingId === addr._id}
                    className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-green-600 transition-colors disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> 
                    {updatingId === addr._id ? "Updating..." : "Set as Default"}
                  </button>
                )}
              </div>

            </div>
          ))}
        </div>
      )}

      {/* --- ADD / EDIT ADDRESS MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-gray-100">
              <h3 className="font-bold text-lg text-gray-900">
                {editingAddress ? "Edit Address" : "Add New Address"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form action={handleAction} className="p-5 space-y-4">
              {/* Hidden field to pass the ID to the server if we are editing */}
              {editingAddress && <input type="hidden" name="addressId" value={editingAddress._id} />}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                <input type="text" name="street" defaultValue={editingAddress?.street || ""} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input type="text" name="city" defaultValue={editingAddress?.city || ""} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State / Province</label>
                  <input type="text" name="state" defaultValue={editingAddress?.state || ""} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code</label>
                  <input type="text" name="zipCode" defaultValue={editingAddress?.zipCode || ""} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  <input type="text" name="country" defaultValue={editingAddress?.country || "United States"} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>
              
              <div className="flex items-center gap-2 pt-2">
                <input type="checkbox" id="isDefault" name="isDefault" defaultChecked={editingAddress?.isDefault || false} className="w-4 h-4 text-blue-600 rounded border-gray-300" />
                <label htmlFor="isDefault" className="text-sm text-gray-600">Set as default shipping address</label>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isPending} className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-blue-400">
                  {isPending ? "Saving..." : "Save Address"}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}