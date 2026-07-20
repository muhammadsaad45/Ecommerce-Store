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
    { group: "General Features", keys: ["Brand", "Model", "Release Date", "SIM Support", "Colors", "Dimensions", "Weight"] },
    { group: "Display", keys: ["Screen Size", "Resolution", "Panel Type", "Refresh Rate", "Protection"] },
    { group: "Performance", keys: ["Processor", "RAM", "Storage", "OS", "GPU"] },
    { group: "Camera", keys: ["Main Camera", "Front Camera", "Video Recording", "Features"] },
    { group: "Battery", keys: ["Capacity", "Charging Speed", "Wireless Charging"] },
    { group: "Connectivity", keys: ["5G", "WiFi", "Bluetooth", "NFC", "USB"] },
  ]),
  createCategory("Laptops", "Portable computers for work, study, and play.", [
    { group: "General Features", keys: ["Brand", "Model", "Release Date", "Color", "Weight", "Material"] },
    { group: "Display", keys: ["Screen Size", "Resolution", "Panel Type", "Refresh Rate"] },
    { group: "Performance", keys: ["Processor", "RAM", "Storage", "GPU", "OS"] },
    { group: "Battery", keys: ["Battery Life", "Charging Speed"] },
    { group: "Ports", keys: ["USB-A", "USB-C", "HDMI", "Audio Jack", "Card Reader"] },
    { group: "Connectivity", keys: ["WiFi", "Bluetooth"] },
  ]),
  createCategory("Tablets", "Slim touchscreen devices for media and productivity.", [
    { group: "General Features", keys: ["Brand", "Model", "Release Date", "Color", "Weight"] },
    { group: "Display", keys: ["Screen Size", "Resolution", "Panel Type", "Refresh Rate"] },
    { group: "Performance", keys: ["Processor", "RAM", "Storage", "OS"] },
    { group: "Camera", keys: ["Main Camera", "Front Camera"] },
    { group: "Battery", keys: ["Capacity", "Battery Life", "Charging Speed"] },
    { group: "Connectivity", keys: ["WiFi", "Bluetooth", "Cellular", "USB-C"] },
  ]),
  createCategory("Smartwatches", "Wearable tech with fitness and notification features.", [
    { group: "General Features", keys: ["Brand", "Model", "Release Date", "Colors", "Weight"] },
    { group: "Display", keys: ["Screen Size", "Panel Type", "Resolution"] },
    { group: "Health", keys: ["Heart Rate", "SpO2", "Sleep Tracking", "Activity Tracking"] },
    { group: "Battery", keys: ["Battery Life", "Charging Speed"] },
    { group: "Connectivity", keys: ["Bluetooth", "WiFi", "GPS", "NFC"] },
    { group: "Build", keys: ["Water Resistance", "Case Material", "Strap Material"] },
  ]),
  createCategory("Headphones", "Over-ear, on-ear, and in-ear audio gear.", [
    { group: "General Features", keys: ["Brand", "Model", "Release Date", "Colors", "Weight"] },
    { group: "Audio", keys: ["Driver Size", "Frequency Response", "Impedance", "Noise Cancellation"] },
    { group: "Connectivity", keys: ["Bluetooth", "Wired", "USB-C", "Aux"] },
    { group: "Battery", keys: ["Battery Life", "Charging Time"] },
    { group: "Features", keys: ["Microphone", "Touch Controls", "Water Resistance"] },
  ]),
  createCategory("TVs", "Smart televisions and home entertainment displays.", [
    { group: "General Features", keys: ["Brand", "Model", "Release Date", "Sizes", "Colors"] },
    { group: "Display", keys: ["Screen Size", "Resolution", "Panel Type", "Refresh Rate", "HDR"] },
    { group: "Smart Features", keys: ["OS", "Voice Assistant", "Apps", "Casting"] },
    { group: "Connectivity", keys: ["HDMI", "USB", "WiFi", "Bluetooth", "Ethernet"] },
    { group: "Audio", keys: ["Speakers", "Dolby Atmos", "Output Power"] },
  ]),
  createCategory("Monitors", "Desktop displays for productivity and gaming.", [
    { group: "General Features", keys: ["Brand", "Model", "Release Date", "Sizes", "Colors"] },
    { group: "Display", keys: ["Screen Size", "Resolution", "Panel Type", "Refresh Rate", "Aspect Ratio"] },
    { group: "Performance", keys: ["Response Time", "Brightness", "HDR", "Adaptive Sync"] },
    { group: "Connectivity", keys: ["HDMI", "DisplayPort", "USB-C", "USB Hub"] },
    { group: "Ergonomics", keys: ["Height Adjustment", "Tilt", "Pivot", "VESA Mount"] },
  ]),
  createCategory("Gaming Consoles", "Dedicated consoles and handheld gaming devices.", [
    { group: "General Features", keys: ["Brand", "Model", "Release Date", "Colors"] },
    { group: "Performance", keys: ["Processor", "GPU", "RAM", "Storage"] },
    { group: "Connectivity", keys: ["WiFi", "Bluetooth", "USB", "HDMI", "Ethernet"] },
    { group: "Controllers", keys: ["Included Controllers", "Wireless Support", "Haptics"] },
    { group: "Library", keys: ["Backwards Compatibility", "Subscription Support", "Exclusive Titles"] },
  ]),
  createCategory("Cameras", "Mirrorless, DSLR, compact, and action cameras.", [
    { group: "General Features", keys: ["Brand", "Model", "Release Date", "Colors", "Weight"] },
    { group: "Sensor", keys: ["Sensor Type", "Megapixels", "ISO Range"] },
    { group: "Lens", keys: ["Lens Mount", "Focal Length", "Aperture"] },
    { group: "Video", keys: ["Resolution", "Frame Rate", "Stabilization"] },
    { group: "Connectivity", keys: ["WiFi", "Bluetooth", "USB-C", "HDMI"] },
    { group: "Battery", keys: ["Battery Life", "Charging"] },
  ]),
  createCategory("Speakers", "Portable and home speaker systems.", [
    { group: "General Features", keys: ["Brand", "Model", "Release Date", "Colors", "Weight"] },
    { group: "Audio", keys: ["Driver Configuration", "Power Output", "Frequency Response"] },
    { group: "Connectivity", keys: ["Bluetooth", "WiFi", "Aux", "USB-C"] },
    { group: "Battery", keys: ["Battery Life", "Charging Time"] },
    { group: "Features", keys: ["Voice Assistant", "Stereo Pairing", "Water Resistance"] },
  ]),
  createCategory("Smart Home", "Connected home devices and automation gear.", [
    { group: "General Features", keys: ["Brand", "Model", "Release Date", "Colors"] },
    { group: "Connectivity", keys: ["WiFi", "Bluetooth", "Thread", "Matter"] },
    { group: "Features", keys: ["Voice Assistant", "Automation", "Sensors", "App Control"] },
    { group: "Power", keys: ["Battery", "Mains Powered", "Power Consumption"] },
  ]),
  createCategory("Accessories", "Cases, chargers, cables, adapters, and add-ons.", [
    { group: "General Features", keys: ["Brand", "Model", "Release Date", "Colors", "Material"] },
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

export function schemaEquals(a: ProductCategoryDefinition | null | undefined, b: ProductCategoryDefinition | null | undefined) {
  return a?.slug === b?.slug;
}
