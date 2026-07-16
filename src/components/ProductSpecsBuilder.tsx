"use client";

import { useEffect, useState } from "react";

export interface Spec {
  group: string;
  key: string;
  value: string;
}

interface SpecsBuilderProps {
  specs: Spec[];
  onChange: (updatedSpecs: Spec[]) => void;
}

// 1. The Strict Blueprint (Foolproofs the dropdowns)
const PREDEFINED_SCHEMA: Record<string, string[]> = {
  "General Features": ["Release Date", "SIM Support", "Dimensions", "Weight", "Colors", "Material"],
  "Display": ["Screen Size", "Resolution", "Panel Type", "Refresh Rate", "Protection", "Brightness"],
  "Performance": ["Processor", "RAM", "Storage", "OS", "GPU"],
  "Camera": ["Main Camera", "Front Camera", "Video Recording", "Features"],
  "Battery": ["Capacity", "Charging Speed", "Wireless Charging"],
};

// 2. The Mandatory Starting Specs
const REQUIRED_SPECS: Spec[] = [
  { group: "General Features", key: "Release Date", value: "" },
  { group: "General Features", key: "Dimensions", value: "" },
  { group: "General Features", key: "Weight", value: "" },
];

export default function ProductSpecsBuilder({ specs = [], onChange }: SpecsBuilderProps) {
  
  // Auto-populate required fields for brand new products
  useEffect(() => {
    if (specs.length === 0) {
      onChange(REQUIRED_SPECS);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [newGroupName, setNewGroupName] = useState("");

  // Target the exact original index in the parent's flat array
  const updateSpec = (originalIndex: number, field: keyof Spec, val: string) => {
    const updated = [...specs];
    updated[originalIndex] = { ...updated[originalIndex], [field]: val };
    onChange(updated);
  };

  const removeSpec = (indexToRemove: number) => {
    onChange(specs.filter((_, index) => index !== indexToRemove));
  };

  const addRowToGroup = (groupName: string) => {
    onChange([...specs, { group: groupName, key: "", value: "" }]);
  };

  const addNewCustomGroup = () => {
    if (newGroupName.trim()) {
      onChange([...specs, { group: newGroupName.trim(), key: "", value: "" }]);
      setNewGroupName("");
    }
  };

  // Group the flat array into a structured object for clean rendering
  // e.g. { "General Features": [ {spec, originalIndex}, ... ] }
  const groupedSpecs = specs.reduce((acc, spec, originalIndex) => {
    if (!acc[spec.group]) acc[spec.group] = [];
    acc[spec.group].push({ ...spec, originalIndex });
    return acc;
  }, {} as Record<string, (Spec & { originalIndex: number })[]>);

  // Identify if a spec is mandatory
  const isRequired = (group: string, key: string) => {
    return group === "General Features" && ["Release Date", "Dimensions", "Weight"].includes(key);
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 mt-8 shadow-sm">
      <div className="mb-6 border-b border-gray-100 pb-4">
        <h3 className="text-lg font-bold text-gray-900">Technical Specifications Matrix</h3>
        <p className="text-xs text-gray-500 mt-1">
          Required specs are locked. Use predefined options to ensure the storefront search filters work perfectly.
        </p>
      </div>

      <div className="space-y-6">
        {Object.entries(groupedSpecs).map(([groupName, groupItems]) => {
          const isPredefinedGroup = !!PREDEFINED_SCHEMA[groupName];
          const availableKeys = PREDEFINED_SCHEMA[groupName] || [];

          return (
            <div key={groupName} className="bg-gray-50 p-5 rounded-xl border border-gray-200 shadow-inner">
              
              {/* Category Header */}
              <h4 className="font-bold text-gray-800 mb-4 text-xs uppercase tracking-wider bg-white inline-block px-3 py-1 rounded-md border border-gray-200">
                {groupName}
              </h4>

              {/* Specs Rows for this specific Category */}
              <div className="space-y-3">
                {groupItems.map((item) => (
                  <div key={item.originalIndex} className="flex gap-3 items-start">
                    
                    {/* Key Input (Dropdown if predefined, Text if custom) */}
                    <div className="flex-1 relative">
                      {isPredefinedGroup ? (
                        <select
                          required
                          value={item.key}
                          onChange={(e) => updateSpec(item.originalIndex, "key", e.target.value)}
                          className={`w-full text-sm px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder:text-gray-400 ${isRequired(groupName, item.key) ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""}`}
                          disabled={isRequired(groupName, item.key)}
                        >
                          <option value="" disabled>Select Attribute...</option>
                          {availableKeys.map(k => (
                            <option key={k} value={k}>{k}</option>
                          ))}
                          {/* Fallback for existing custom keys in the database */}
                          {item.key && !availableKeys.includes(item.key) && (
                            <option value={item.key}>{item.key}</option>
                          )}
                        </select>
                      ) : (
                        <input
                          required
                          type="text"
                          placeholder="Custom Attribute..."
                          value={item.key}
                          onChange={(e) => updateSpec(item.originalIndex, "key", e.target.value)}
                          className="w-full text-sm px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder:text-gray-400"
                        />
                      )}
                    </div>

                    {/* Value Input */}
                    <div className="flex-2">
                      <input
                        required
                        type="text"
                        placeholder={isRequired(groupName, item.key) ? "Required value..." : "Value..."}
                        value={item.value}
                        onChange={(e) => updateSpec(item.originalIndex, "value", e.target.value)}
                        className="w-full text-sm px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder:text-gray-400"
                      />
                    </div>

                    {/* Delete Button (Hidden if it's a mandatory spec) */}
                    <div className="w-10 flex justify-end">
                      {!isRequired(groupName, item.key) ? (
                        <button
                          type="button"
                          onClick={() => removeSpec(item.originalIndex)}
                          className="text-gray-400 hover:text-red-600 p-2 rounded-lg hover:bg-white transition-colors"
                          title="Remove Spec"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      ) : (
                        <div className="w-9 h-9" /> /* Spacer to keep alignment */
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Inline Add Button for this Category */}
              <button
                type="button"
                onClick={() => addRowToGroup(groupName)}
                className="mt-4 text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1.5 transition-colors bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                Add row to {groupName}
              </button>
            </div>
          );
        })}
      </div>

      {/* Add a Completely New Category Block */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Add a New Category block</h4>
        <div className="flex gap-3">
          
          {/* Using a datalist gives us autocomplete for predefined schemas, while allowing custom typing */}
          <input
            type="text"
            list="category-suggestions"
            placeholder="e.g. Connectivity, Audio..."
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            className="flex-1 text-sm px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder:text-gray-400"
          />
          <datalist id="category-suggestions">
            {Object.keys(PREDEFINED_SCHEMA)
              .filter(cat => !Object.keys(groupedSpecs).includes(cat))
              .map(cat => <option key={cat} value={cat} />)
            }
          </datalist>
          
          <button
            type="button"
            onClick={addNewCustomGroup}
            disabled={!newGroupName.trim()}
            className="bg-gray-900 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-gray-800 disabled:opacity-50 transition-all shadow-sm"
          >
            Add Category
          </button>
        </div>
      </div>
    </div>
  );
}