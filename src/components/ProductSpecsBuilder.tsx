"use client";

export interface Spec {
  group: string;
  key: string;
  value: string;
}

interface SpecsBuilderProps {
  specs: Spec[];
  onChange: (updatedSpecs: Spec[]) => void;
}

export default function ProductSpecsBuilder({ specs = [], onChange }: SpecsBuilderProps) {
  
  // Add an empty spec row
  const addRow = () => {
    onChange([...specs, { group: "", key: "", value: "" }]);
  };

  // Remove a spec row at a specific index
  const removeRow = (indexToRemove: number) => {
    const updated = specs.filter((_, index) => index !== indexToRemove);
    onChange(updated);
  };

  // Handle value modifications on a specific row/field
  const handleFieldChange = (index: number, field: keyof Spec, val: string) => {
    const updated = specs.map((spec, idx) => {
      if (idx === index) {
        return { ...spec, [field]: val };
      }
      return spec;
    });
    onChange(updated);
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 mt-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Technical Specifications Matrix</h3>
          <p className="text-xs text-gray-500 mt-1">
            Group specs logically (e.g., "Performance", "Display") to automatically build clean section tables on the storefront.
          </p>
        </div>
        <button
          type="button"
          onClick={addRow}
          className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Add Row
        </button>
      </div>

      {specs.length === 0 ? (
        <div className="border border-dashed border-gray-200 rounded-xl p-8 text-center text-gray-400 text-sm">
          No custom specifications added yet. Click "Add Row" to start adding attributes.
        </div>
      ) : (
        <div className="space-y-3">
          {/* Header titles for guidance */}
          <div className="hidden sm:grid grid-cols-12 gap-4 text-xs font-bold text-gray-500 px-2">
            <div className="col-span-4">Group (e.g. Performance)</div>
            <div className="col-span-4">Attribute Key (e.g. Processor)</div>
            <div className="col-span-3">Value (e.g. Helio G100)</div>
            <div className="col-span-1"></div>
          </div>

          {specs.map((spec, index) => (
            <div key={index} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center bg-gray-50 p-3 sm:p-2 rounded-xl border border-gray-100">
              
              {/* Group Field */}
              <div className="col-span-4">
                <input
                  required
                  type="text"
                  placeholder="e.g. Performance"
                  value={spec.group}
                  onChange={(e) => handleFieldChange(index, "group", e.target.value)}
                  className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                />
              </div>

              {/* Key Field */}
              <div className="col-span-4">
                <input
                  required
                  type="text"
                  placeholder="e.g. Processor"
                  value={spec.key}
                  onChange={(e) => handleFieldChange(index, "key", e.target.value)}
                  className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                />
              </div>

              {/* Value Field */}
              <div className="col-span-3">
                <input
                  required
                  type="text"
                  placeholder="e.g. MediaTek Helio G100"
                  value={spec.value}
                  onChange={(e) => handleFieldChange(index, "value", e.target.value)}
                  className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                />
              </div>

              {/* Delete Button */}
              <div className="col-span-1 flex justify-end">
                <button
                  type="button"
                  onClick={() => removeRow(index)}
                  className="text-gray-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-white transition-colors"
                  aria-label="Delete row"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}