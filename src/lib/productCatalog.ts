export type ProductSpecDefinition = {
  group: string;
  keys: string[];
};

export type ProductCategoryDefinition = {
  name: string;
  slug: string;
  description: string;
  specGroups: ProductSpecDefinition[];
  source?: "default" | "custom";
};

export type ProductSpecValue = {
  group: string;
  key: string;
  value: string;
};

export function slugifyCategoryName(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function createSpecFilterParam(group: string, key: string) {
  return `spec_${slugifyCategoryName(group)}__${slugifyCategoryName(key)}`;
}

export function createSpecFilterRangeParam(group: string, key: string, suffix: "from" | "to") {
  return `${createSpecFilterParam(group, key)}_${suffix}`;
}

export function isDateLikeSpecKey(key: string) {
  const normalizedKey = key.toLowerCase();
  return normalizedKey.includes("date") || normalizedKey.includes("released");
}

const RECOMMENDED_FILTER_KEYS_BY_CATEGORY: Record<string, string[]> = {
  smartphones: ["Brand", "Screen Size", "Processor", "RAM", "Storage", "Battery Capacity", "5G"],
  laptops: ["Brand", "Processor", "RAM", "Storage", "Screen Size", "Battery Life"],
  tablets: ["Brand", "Screen Size", "Processor", "RAM", "Storage", "Cellular"],
  smartwatches: ["Brand", "Screen Size", "Battery Life", "GPS", "Water Resistance"],
  headphones: ["Brand", "Noise Cancellation", "Battery Life", "Bluetooth", "Driver Size"],
  tvs: ["Brand", "Screen Size", "Resolution", "OS", "HDR"],
  monitors: ["Brand", "Screen Size", "Resolution", "Refresh Rate", "Panel Type"],
  "gaming-consoles": ["Brand", "Processor", "Storage", "GPU", "WiFi"],
  cameras: ["Brand", "Sensor Type", "Megapixels", "Video Resolution", "Battery Life"],
  speakers: ["Brand", "Power Output", "Bluetooth", "Battery Life", "Water Resistance"],
  "smart-home": ["Brand", "WiFi", "Voice Assistant", "Automation", "Battery"],
  accessories: ["Brand", "Device Type", "Universal Fit", "USB-C", "Wireless"],
};

const FALLBACK_FILTER_ORDER = ["Brand", "Processor", "RAM", "Storage", "Screen Size", "Battery Life", "Battery Capacity", "Color", "Model", "OS", "Resolution"];

export function getRelevantSpecFilters(schema: ProductCategoryDefinition) {
  const recommendedKeys = RECOMMENDED_FILTER_KEYS_BY_CATEGORY[schema.slug] || FALLBACK_FILTER_ORDER;
  const matches: Array<{ group: string; key: string }> = [];
  const seen = new Set<string>();

  schema.specGroups.forEach((group) => {
    group.keys.forEach((key) => {
      const normalizedKey = key.toLowerCase();
      const shouldInclude = recommendedKeys.some((candidate) => candidate.toLowerCase() === normalizedKey);

      if (shouldInclude) {
        const token = `${group.group}::${key}`;
        if (!seen.has(token)) {
          matches.push({ group: group.group, key });
          seen.add(token);
        }
      }
    });
  });

  if (matches.length > 0) {
    return matches.slice(0, 6);
  }

  return schema.specGroups
    .flatMap((group) => group.keys.map((key) => ({ group: group.group, key })))
    .slice(0, 6);
}

export function resolveCategoryByIdentifier(categories: ProductCategoryDefinition[], identifier?: string | null) {
  if (!identifier) {
    return null;
  }

  const normalizedIdentifier = identifier.trim();
  return categories.find((category) => category.slug === normalizedIdentifier || category.name === normalizedIdentifier) || null;
}

function createCategory(name: string, description: string, specGroups: ProductSpecDefinition[]): ProductCategoryDefinition {
  return {
    name,
    slug: slugifyCategoryName(name),
    description,
    specGroups,
    source: "default",
  };
}

export const DEFAULT_PRODUCT_CATEGORIES: ProductCategoryDefinition[] = [
  createCategory("Smartphones", "Mobile phones and flagship handheld devices.", [
    { group: "General Features", keys: ["Brand", "Model", "SIM Support", "Colors", "Dimensions", "Weight"] },
    { group: "Display", keys: ["Screen Size", "Resolution", "Panel Type", "Refresh Rate", "Protection"] },
    { group: "Performance", keys: ["Processor", "RAM", "Storage", "OS", "GPU"] },
    { group: "Camera", keys: ["Main Camera", "Front Camera", "Video Recording", "Features"] },
    { group: "Battery", keys: ["Capacity", "Charging Speed", "Wireless Charging"] },
    { group: "Connectivity", keys: ["5G", "WiFi", "Bluetooth", "NFC", "USB"] },
  ]),
  createCategory("Laptops", "Portable computers for work, study, and play.", [
    { group: "General Features", keys: ["Brand", "Model", "Color", "Weight", "Material"] },
    { group: "Display", keys: ["Screen Size", "Resolution", "Panel Type", "Refresh Rate"] },
    { group: "Performance", keys: ["Processor", "RAM", "Storage", "GPU", "OS"] },
    { group: "Battery", keys: ["Battery Life", "Charging Speed"] },
    { group: "Ports", keys: ["USB-A", "USB-C", "HDMI", "Audio Jack", "Card Reader"] },
    { group: "Connectivity", keys: ["WiFi", "Bluetooth"] },
  ]),
  createCategory("Tablets", "Slim touchscreen devices for media and productivity.", [
    { group: "General Features", keys: ["Brand", "Model", "Color", "Weight"] },
    { group: "Display", keys: ["Screen Size", "Resolution", "Panel Type", "Refresh Rate"] },
    { group: "Performance", keys: ["Processor", "RAM", "Storage", "OS"] },
    { group: "Camera", keys: ["Main Camera", "Front Camera"] },
    { group: "Battery", keys: ["Capacity", "Battery Life", "Charging Speed"] },
    { group: "Connectivity", keys: ["WiFi", "Bluetooth", "Cellular", "USB-C"] },
  ]),
  createCategory("Smartwatches", "Wearable tech with fitness and notification features.", [
    { group: "General Features", keys: ["Brand", "Model", "Colors", "Weight"] },
    { group: "Display", keys: ["Screen Size", "Panel Type", "Resolution"] },
    { group: "Health", keys: ["Heart Rate", "SpO2", "Sleep Tracking", "Activity Tracking"] },
    { group: "Battery", keys: ["Battery Life", "Charging Speed"] },
    { group: "Connectivity", keys: ["Bluetooth", "WiFi", "GPS", "NFC"] },
    { group: "Build", keys: ["Water Resistance", "Case Material", "Strap Material"] },
  ]),
  createCategory("Headphones", "Over-ear, on-ear, and in-ear audio gear.", [
    { group: "General Features", keys: ["Brand", "Model", "Colors", "Weight"] },
    { group: "Audio", keys: ["Driver Size", "Frequency Response", "Impedance", "Noise Cancellation"] },
    { group: "Connectivity", keys: ["Bluetooth", "Wired", "USB-C", "Aux"] },
    { group: "Battery", keys: ["Battery Life", "Charging Time"] },
    { group: "Features", keys: ["Microphone", "Touch Controls", "Water Resistance"] },
  ]),
  createCategory("TVs", "Smart televisions and home entertainment displays.", [
    { group: "General Features", keys: ["Brand", "Model", "Sizes", "Colors"] },
    { group: "Display", keys: ["Screen Size", "Resolution", "Panel Type", "Refresh Rate", "HDR"] },
    { group: "Smart Features", keys: ["OS", "Voice Assistant", "Apps", "Casting"] },
    { group: "Connectivity", keys: ["HDMI", "USB", "WiFi", "Bluetooth", "Ethernet"] },
    { group: "Audio", keys: ["Speakers", "Dolby Atmos", "Output Power"] },
  ]),
  createCategory("Monitors", "Desktop displays for productivity and gaming.", [
    { group: "General Features", keys: ["Brand", "Model", "Sizes", "Colors"] },
    { group: "Display", keys: ["Screen Size", "Resolution", "Panel Type", "Refresh Rate", "Aspect Ratio"] },
    { group: "Performance", keys: ["Response Time", "Brightness", "HDR", "Adaptive Sync"] },
    { group: "Connectivity", keys: ["HDMI", "DisplayPort", "USB-C", "USB Hub"] },
    { group: "Ergonomics", keys: ["Height Adjustment", "Tilt", "Pivot", "VESA Mount"] },
  ]),
  createCategory("Gaming Consoles", "Dedicated consoles and handheld gaming devices.", [
    { group: "General Features", keys: ["Brand", "Model", "Colors"] },
    { group: "Performance", keys: ["Processor", "GPU", "RAM", "Storage"] },
    { group: "Connectivity", keys: ["WiFi", "Bluetooth", "USB", "HDMI", "Ethernet"] },
    { group: "Controllers", keys: ["Included Controllers", "Wireless Support", "Haptics"] },
    { group: "Library", keys: ["Backwards Compatibility", "Subscription Support", "Exclusive Titles"] },
  ]),
  createCategory("Cameras", "Mirrorless, DSLR, compact, and action cameras.", [
    { group: "General Features", keys: ["Brand", "Model", "Colors", "Weight"] },
    { group: "Sensor", keys: ["Sensor Type", "Megapixels", "ISO Range"] },
    { group: "Lens", keys: ["Lens Mount", "Focal Length", "Aperture"] },
    { group: "Video", keys: ["Resolution", "Frame Rate", "Stabilization"] },
    { group: "Connectivity", keys: ["WiFi", "Bluetooth", "USB-C", "HDMI"] },
    { group: "Battery", keys: ["Battery Life", "Charging"] },
  ]),
  createCategory("Speakers", "Portable and home speaker systems.", [
    { group: "General Features", keys: ["Brand", "Model", "Colors", "Weight"] },
    { group: "Audio", keys: ["Driver Configuration", "Power Output", "Frequency Response"] },
    { group: "Connectivity", keys: ["Bluetooth", "WiFi", "Aux", "USB-C"] },
    { group: "Battery", keys: ["Battery Life", "Charging Time"] },
    { group: "Features", keys: ["Voice Assistant", "Stereo Pairing", "Water Resistance"] },
  ]),
  createCategory("Smart Home", "Connected home devices and automation gear.", [
    { group: "General Features", keys: ["Brand", "Model", "Colors"] },
    { group: "Connectivity", keys: ["WiFi", "Bluetooth", "Thread", "Matter"] },
    { group: "Features", keys: ["Voice Assistant", "Automation", "Sensors", "App Control"] },
    { group: "Power", keys: ["Battery", "Mains Powered", "Power Consumption"] },
  ]),
  createCategory("Accessories", "Cases, chargers, cables, adapters, and add-ons.", [
    { group: "General Features", keys: ["Brand", "Model", "Colors", "Material"] },
    { group: "Compatibility", keys: ["Device Type", "Supported Models", "Universal Fit"] },
    { group: "Connectivity", keys: ["USB-C", "Lightning", "Bluetooth", "Wireless"] },
    { group: "Build", keys: ["Dimensions", "Weight", "Durability"] },
  ]),
];

export function buildSpecsFromSchema(schema: ProductCategoryDefinition, currentSpecs: ProductSpecValue[] = []): ProductSpecValue[] {
  const existingMap = new Map(currentSpecs.map((spec) => [`${spec.group}::${spec.key}`, spec.value]));

  return schema.specGroups.flatMap((group) =>
    group.keys.map((key) => ({
      group: group.group,
      key,
      value: existingMap.get(`${group.group}::${key}`) || "",
    }))
  );
}

export function collectSpecValuesByFilterParam(
  schema: ProductCategoryDefinition,
  products: Array<{ specs?: ProductSpecValue[] }>
): Record<string, string[]> {
  const valuesByParam: Record<string, Set<string>> = {};

  schema.specGroups.forEach((group) => {
    group.keys.forEach((key) => {
      valuesByParam[createSpecFilterParam(group.group, key)] = new Set<string>();
    });
  });

  products.forEach((product) => {
    (product.specs || []).forEach((spec) => {
      const param = createSpecFilterParam(spec.group, spec.key);
      if (valuesByParam[param]) {
        const value = spec.value?.trim();
        if (value) {
          valuesByParam[param].add(value);
        }
      }
    });
  });

  return Object.fromEntries(
    Object.entries(valuesByParam).map(([param, values]) => [param, Array.from(values).sort((a, b) => a.localeCompare(b))])
  );
}

export function schemaEquals(a: ProductCategoryDefinition | null | undefined, b: ProductCategoryDefinition | null | undefined) {
  return a?.slug === b?.slug;
}
