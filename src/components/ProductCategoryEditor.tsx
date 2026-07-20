"use client";

import { useMemo, useState } from "react";
import { ProductCategoryDefinition, slugifyCategoryName } from "@/lib/productCatalog";

type CategoryEditorGroup = {
  group: string;
  keysText: string;
};

interface ProductCategoryEditorProps {
  open: boolean;
  onClose: () => void;
  onCreated: (category: ProductCategoryDefinition) => void;
}

function createBlankGroup(): CategoryEditorGroup {
  return { group: "", keysText: "" };
}

export default function ProductCategoryEditor({ open, onClose, onCreated }: ProductCategoryEditorProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [groups, setGroups] = useState<CategoryEditorGroup[]>([createBlankGroup()]);
  const [saving, setSaving] = useState(false);

  const slug = useMemo(() => slugifyCategoryName(name), [name]);

  if (!open) {
    return null;
  }

  const addGroup = () => setGroups((currentGroups) => [...currentGroups, createBlankGroup()]);
  const removeGroup = (index: number) => setGroups((currentGroups) => currentGroups.filter((_, currentIndex) => currentIndex !== index));

  const handleSave = async () => {
    const normalizedGroups = groups
      .map((group) => ({
        group: group.group.trim(),
        keys: group.keysText
          .split(",")
          .map((key) => key.trim())
          .filter(Boolean),
      }))
      .filter((group) => group.group && group.keys.length > 0);

    if (!name.trim() || normalizedGroups.length === 0) {
      alert("Add a category name and at least one spec group with keys.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/product-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          slug,
          description: description.trim(),
          specGroups: normalizedGroups,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create category");
      }

      const data = await response.json();
      onCreated(data.category as ProductCategoryDefinition);

      setName("");
      setDescription("");
      setGroups([createBlankGroup()]);
      onClose();
    } catch (error) {
      console.error("Failed to create category:", error);
      alert(error instanceof Error ? error.message : "Failed to create category");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
      <div className="w-full max-w-3xl rounded-3xl bg-white shadow-2xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Create Product Category</h3>
            <p className="text-sm text-gray-500">Define a reusable category schema for future products.</p>
          </div>
          <button type="button" onClick={onClose} className="text-sm font-semibold text-gray-500 hover:text-gray-900">Close</button>
        </div>

        <div className="max-h-[80vh] overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} type="text" className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. Gaming Accessories" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Slug</label>
              <input value={slug} readOnly className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-gray-600" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder="Optional description for admins" />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold uppercase tracking-wider text-gray-500">Specification Groups</h4>
              <button type="button" onClick={addGroup} className="text-sm font-semibold text-blue-600 hover:text-blue-800">Add Group</button>
            </div>

            {groups.map((group, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3 items-start rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Group Name</label>
                  <input value={group.group} onChange={(e) => setGroups((currentGroups) => currentGroups.map((item, currentIndex) => currentIndex === index ? { ...item, group: e.target.value } : item))} type="text" className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. Display" />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Spec Keys</label>
                  <input value={group.keysText} onChange={(e) => setGroups((currentGroups) => currentGroups.map((item, currentIndex) => currentIndex === index ? { ...item, keysText: e.target.value } : item))} type="text" className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" placeholder="Comma-separated keys, e.g. Brand, Model, Weight" />
                </div>
                <div className="pt-7">
                  <button type="button" onClick={() => removeGroup(index)} disabled={groups.length === 1} className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-600 hover:text-red-600 disabled:opacity-50 disabled:hover:text-gray-600">Remove</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4 bg-gray-50">
          <button type="button" onClick={onClose} className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-white">Cancel</button>
          <button type="button" onClick={handleSave} disabled={saving} className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
            {saving ? "Saving..." : "Create Category"}
          </button>
        </div>
      </div>
    </div>
  );
}
