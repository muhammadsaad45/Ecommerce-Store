"use client";

import { useEffect } from "react";
import { buildSpecsFromSchema, isDateLikeSpecKey, ProductCategoryDefinition, ProductSpecValue } from "@/lib/productCatalog";

export interface Spec {
  group: string;
  key: string;
  value: string;
}

interface SpecsBuilderProps {
  schema: ProductCategoryDefinition | null;
  specs: Spec[];
  onChange: (updatedSpecs: Spec[]) => void;
}

function sameSpecs(a: Spec[], b: Spec[]) {
  if (a.length !== b.length) {
    return false;
  }

  return a.every((spec, index) => {
    const nextSpec = b[index];
    return spec.group === nextSpec.group && spec.key === nextSpec.key && spec.value === nextSpec.value;
  });
}

export default function ProductSpecsBuilder({ schema, specs, onChange }: SpecsBuilderProps) {
  useEffect(() => {
    if (!schema) {
      return;
    }

    const normalizedSpecs = buildSpecsFromSchema(schema, specs as ProductSpecValue[]);

    if (!sameSpecs(specs, normalizedSpecs)) {
      onChange(normalizedSpecs);
    }
  }, [schema, specs, onChange]);

  const updateSpec = (index: number, value: string) => {
    const updatedSpecs = [...specs];
    updatedSpecs[index] = { ...updatedSpecs[index], value };
    onChange(updatedSpecs);
  };

  if (!schema) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-gray-200 mt-8 shadow-sm">
        <div className="text-sm text-gray-500">Select a product category to load its fixed specification fields.</div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 mt-8 shadow-sm">
      <div className="mb-6 border-b border-gray-100 pb-4">
        <h3 className="text-lg font-bold text-gray-900">Category Specifications</h3>
        <p className="text-xs text-gray-500 mt-1">
          These fields are fixed for {schema.name}. Populate them to keep search and filtering consistent.
        </p>
      </div>

      <div className="space-y-6">
        {schema.specGroups.map((group) => (
          <div key={group.group} className="bg-gray-50 p-5 rounded-xl border border-gray-200 shadow-inner">
            <h4 className="font-bold text-gray-800 mb-4 text-xs uppercase tracking-wider bg-white inline-block px-3 py-1 rounded-md border border-gray-200">
              {group.group}
            </h4>

            <div className="space-y-3">
              {group.keys.map((key) => {
                const specIndex = specs.findIndex((spec) => spec.group === group.group && spec.key === key);
                const currentValue = specIndex >= 0 ? specs[specIndex].value : "";

                return (
                  <div key={`${group.group}-${key}`} className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-3 items-center">
                    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700">
                      {key}
                    </div>
                    {isDateLikeSpecKey(key) ? (
                      <input
                        required
                        type="date"
                        value={currentValue}
                        onChange={(e) => {
                          if (specIndex >= 0) {
                            updateSpec(specIndex, e.target.value);
                          }
                        }}
                        className="w-full text-sm px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                      />
                    ) : (
                      <input
                        required
                        type="text"
                        placeholder={`Enter ${key.toLowerCase()}...`}
                        value={currentValue}
                        onChange={(e) => {
                          if (specIndex >= 0) {
                            updateSpec(specIndex, e.target.value);
                          }
                        }}
                        className="w-full text-sm px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder:text-gray-400"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}