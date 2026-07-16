"use client";

interface Spec {
  key: string;
  value: string;
  group: string;
}

export default function ProductSpecs({ specs }: { specs: Spec[] }) {
  if (!specs || specs.length === 0) return null;

  // Group the flat array into an object clustered by the "group" key
  // e.g., { "Performance": [{key: "Processor", value: "..."}], "Display": [...] }
  const groupedSpecs = specs.reduce((acc, spec) => {
    if (!acc[spec.group]) {
      acc[spec.group] = [];
    }
    acc[spec.group].push(spec);
    return acc;
  }, {} as Record<string, Spec[]>);

  return (
    <div className="mt-12 border-t border-gray-100 pt-10">
      <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight mb-8">
        Technical Specifications
      </h2>

      {/* Grid wrapper for the grouped blocks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {Object.entries(groupedSpecs).map(([groupName, items]) => (
          <div 
            key={groupName} 
            className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm h-fit"
          >
            {/* Group Title (e.g., Performance, Display) */}
            <h3 className="text-sm font-bold text-blue-600 uppercase tracking-wider border-b border-gray-50 pb-3 mb-4">
              {groupName}
            </h3>

            {/* Key-Value Specification Grid */}
            <div className="space-y-3">
              {items.map((item, index) => (
                <div 
                  key={index} 
                  className="grid grid-cols-3 text-sm py-1 border-b border-gray-50 last:border-0"
                >
                  <span className="text-gray-400 font-medium col-span-1">
                    {item.key}
                  </span>
                  <span className="text-gray-900 font-semibold col-span-2 text-right md:text-left pl-2">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}