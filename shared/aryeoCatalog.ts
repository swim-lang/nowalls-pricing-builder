export const PRICING_CATALOG_REVIEWED_AT = "2026-09-21";
export const PRICING_REVIEW_ONLY = true;

// This is the private prototype form. Brian's restored production form is intentionally
// not referenced by this project while the September pricing concept is under review.
export const ARYEO_ORDER_FORM_ID = "019cabc9-1539-7102-892e-6368f97d965b";
export const ARYEO_ORDER_FORM_URL = `https://nowalls.aryeo.com/order-forms/${ARYEO_ORDER_FORM_ID}`;

export type SizeTier =
  | "under_1000"
  | "1001_2000"
  | "2001_3000"
  | "3001_4000"
  | "4000_6000"
  | "6001_8000"
  | "over_8000"
  | "not_sure";

export type PricedSizeTier = Exclude<SizeTier, "not_sure">;

export const SIZE_TIER_CONFIG: Array<{ key: PricedSizeTier; label: string; shortLabel: string }> = [
  { key: "under_1000", label: "0–1,000 sq ft", shortLabel: "0–1k" },
  { key: "1001_2000", label: "1,001–2,000 sq ft", shortLabel: "1–2k" },
  { key: "2001_3000", label: "2,001–3,000 sq ft", shortLabel: "2–3k" },
  { key: "3001_4000", label: "3,001–4,000 sq ft", shortLabel: "3–4k" },
  { key: "4000_6000", label: "4,001–6,000 sq ft", shortLabel: "4–6k" },
  { key: "6001_8000", label: "6,001–8,000 sq ft", shortLabel: "6–8k" },
  { key: "over_8000", label: "8,001+ sq ft", shortLabel: "8k+" },
];

export type PackageId =
  | "starter"
  | "essentials"
  | "signature"
  | "premier"
  | "influencer"
  | "contentCreator"
  | "landPackage"
  | "lot"
  | "locationPackage"
  | "preListing"
  | "exteriorPhotos";

export type PackageCategory = "core" | "brand" | "creator" | "land" | "pre-listing";
export type PricingMode = "square-footage" | "tiered" | "fixed";

export type CatalogVariant = {
  key: string;
  label: string;
  price: number;
  durationMinutes: number;
  photoCount?: string;
  detail?: string;
};

export type PackageConfig = {
  id: PackageId;
  name: string;
  aryeoProductTitle: string;
  purpose: string;
  bestFor: string;
  category: PackageCategory;
  pricingMode: PricingMode;
  includes: string[];
  photoCount?: string;
  selectionHint?: string;
  variants: CatalogVariant[];
};

export type AddOnConfig = {
  id: string;
  name: string;
  aryeoProductTitle: string;
  purpose: string;
  price?: number;
  priceLabel?: string;
  priceSuffix?: string;
  aryeoType: "MAIN" | "ADDON";
};

const variant = (
  key: string,
  label: string,
  price: number,
  durationMinutes: number,
  photoCount?: string,
  detail?: string,
): CatalogVariant => ({ key, label, price, durationMinutes, photoCount, detail });

const squareFootageVariants = (
  prices: Record<PricedSizeTier, number>,
  photos: Record<PricedSizeTier, number>,
  durationMinutes: number,
): CatalogVariant[] => SIZE_TIER_CONFIG.map(({ key, label }) => (
  variant(key, label, prices[key], durationMinutes, `${photos[key]} photos`)
));

export const FEATURED_PACKAGE_IDS: PackageId[] = [
  "starter",
  "essentials",
  "signature",
  "premier",
  "influencer",
  "contentCreator",
];

export const PACKAGE_CONFIG: { packages: Record<PackageId, PackageConfig> } = {
  packages: {
    starter: {
      id: "starter",
      name: "Starter",
      aryeoProductTitle: "Starter Package",
      purpose: "Clean, polished listing essentials without extra production.",
      bestFor: "Smaller listings and quick-turn properties that still need polish",
      category: "core",
      pricingMode: "square-footage",
      includes: ["Professional photos", "Agent-branded property website", "2D floor plan"],
      variants: squareFootageVariants(
        { under_1000: 195, "1001_2000": 229, "2001_3000": 265, "3001_4000": 300, "4000_6000": 335, "6001_8000": 370, over_8000: 405 },
        { under_1000: 25, "1001_2000": 30, "2001_3000": 35, "3001_4000": 40, "4000_6000": 45, "6001_8000": 50, over_8000: 55 },
        30,
      ),
    },
    essentials: {
      id: "essentials",
      name: "Essentials",
      aryeoProductTitle: "Essentials Package",
      purpose: "The go-to package for agents who want to market with intention.",
      bestFor: "Standard listings that need a polished, versatile launch",
      category: "core",
      pricingMode: "square-footage",
      includes: [
        "Professional photos",
        "Classic horizontal video or Classic vertical reel",
        "Matterport or Zillow 3D tour",
        "2D floor plan",
        "Virtual twilight",
        "Agent-branded property website + marketing kit",
      ],
      selectionHint: "Choose the video format and 3D-tour provider during final booking.",
      variants: squareFootageVariants(
        { under_1000: 460, "1001_2000": 495, "2001_3000": 530, "3001_4000": 565, "4000_6000": 600, "6001_8000": 635, over_8000: 670 },
        { under_1000: 30, "1001_2000": 35, "2001_3000": 40, "3001_4000": 45, "4000_6000": 50, "6001_8000": 55, over_8000: 60 },
        120,
      ),
    },
    signature: {
      id: "signature",
      name: "Signature",
      aryeoProductTitle: "Signature Package",
      purpose: "An immersive campaign designed to make higher-end homes feel unmistakable.",
      bestFor: "Listings that need cinematic depth and a stronger launch",
      category: "core",
      pricingMode: "square-footage",
      includes: [
        "Professional photos",
        "Luxe Cinematic Video or Luxe Cinematic Reel",
        "Zillow ShowingTime+ 3D or Matterport 3D",
        "Up to 10 aerial drone photos + video",
        "2D floor plan",
        "Virtual twilight",
        "Agent-branded property website + marketing kit",
      ],
      selectionHint: "Choose a cinematic format and 3D-tour provider during final booking.",
      variants: squareFootageVariants(
        { under_1000: 714, "1001_2000": 749, "2001_3000": 784, "3001_4000": 819, "4000_6000": 854, "6001_8000": 889, over_8000: 924 },
        { under_1000: 30, "1001_2000": 35, "2001_3000": 40, "3001_4000": 45, "4000_6000": 50, "6001_8000": 55, over_8000: 60 },
        180,
      ),
    },
    premier: {
      id: "premier",
      name: "Premier",
      aryeoProductTitle: "Premier Package",
      purpose: "The complete listing campaign, built to elevate the story and accelerate interest.",
      bestFor: "Luxury, high-value, and story-driven properties",
      category: "core",
      pricingMode: "square-footage",
      includes: [
        "Professional photos",
        "Luxe Cinematic Video",
        "Luxe Cinematic Reel",
        "Up to 10 aerial drone photos + video",
        "Zillow ShowingTime+ 3D or Matterport 3D",
        "2D floor plan",
        "Virtual twilight",
        "Agent-branded property website + marketing kit",
      ],
      selectionHint: "Choose the 3D-tour provider during final booking.",
      variants: squareFootageVariants(
        { under_1000: 990, "1001_2000": 1025, "2001_3000": 1060, "3001_4000": 1095, "4000_6000": 1130, "6001_8000": 1165, over_8000: 1200 },
        { under_1000: 30, "1001_2000": 35, "2001_3000": 40, "3001_4000": 45, "4000_6000": 50, "6001_8000": 55, over_8000: 60 },
        240,
      ),
    },
    influencer: {
      id: "influencer",
      name: "The Influencer",
      aryeoProductTitle: "The Influencer",
      purpose: "A listing campaign that also grows the agent's personal brand.",
      bestFor: "Agents who want every listing to create meaningful social momentum",
      category: "brand",
      pricingMode: "square-footage",
      includes: [
        "Professional horizontal + vertical photos",
        "Influencer vertical reel with agent and lifestyle scenes",
        "Coming soon video",
        "Up to 10 aerial photos + video",
        "2D floor plan",
        "Virtual twilight",
        "Agent-branded property website + marketing kit",
      ],
      variants: squareFootageVariants(
        { under_1000: 609, "1001_2000": 644, "2001_3000": 679, "3001_4000": 714, "4000_6000": 749, "6001_8000": 784, over_8000: 819 },
        { under_1000: 30, "1001_2000": 35, "2001_3000": 40, "3001_4000": 45, "4000_6000": 50, "6001_8000": 55, over_8000: 60 },
        150,
      ),
    },
    contentCreator: {
      id: "contentCreator",
      name: "Content Creator",
      aryeoProductTitle: "Content Creator Package",
      purpose: "Turn one production session into a long-form story and a bank of social content.",
      bestFor: "Agents building a YouTube presence and a consistent personal-brand content engine",
      category: "creator",
      pricingMode: "tiered",
      includes: [
        "Professional horizontal + vertical photos",
        "One 5–10 minute horizontal YouTube video",
        "Two to six vertical reels, based on tier",
        "Neighborhood and lifestyle scenes",
        "Up to 10 aerial photos + B-roll clips",
        "2D floor plan",
        "Virtual twilight",
        "Agent-branded property website + marketing kit",
      ],
      photoCount: "Horizontal + vertical photos",
      selectionHint: "Choose Creator, Creator Plus, or Creator Max after the visual concept is approved.",
      variants: [
        variant("creator", "Creator", 1295, 240, undefined, "1 long-format YouTube video + 2 vertical reels"),
        variant("creator-plus", "Creator Plus", 1595, 300, undefined, "1 long-format YouTube video + 4 vertical reels"),
        variant("creator-max", "Creator Max", 1795, 360, undefined, "1 long-format YouTube video + 5–6 vertical reels"),
      ],
    },
    landPackage: {
      id: "landPackage",
      name: "Land Package",
      aryeoProductTitle: "Land Package",
      purpose: "Full visual context for land, lots, and acreage.",
      bestFor: "Land listings where boundaries, access, and neighborhood context matter",
      category: "land",
      pricingMode: "fixed",
      includes: [
        "Up to 20 ground photos",
        "10–15 drone photos with boundary graphics",
        "Neighborhood photos",
        "Drone video with boundary lines",
        "Neighborhood and lifestyle video clips",
      ],
      variants: [variant("land-package", "Land Package", 495, 45)],
    },
    lot: {
      id: "lot",
      name: "The Lot",
      aryeoProductTitle: "Pre Listing Packages",
      purpose: "A compact photo package for a straightforward lot listing.",
      bestFor: "Lots that need clean ground and aerial coverage",
      category: "land",
      pricingMode: "fixed",
      includes: ["Up to 10 exterior photos", "Up to 10 drone photos"],
      photoCount: "Up to 20 photos",
      variants: [variant("the-lot", "The Lot", 179, 40)],
    },
    locationPackage: {
      id: "locationPackage",
      name: "Location Package",
      aryeoProductTitle: "Pre Listing Packages",
      purpose: "A land package that adds neighborhood and lifestyle context.",
      bestFor: "Location-driven lots where the surrounding area helps sell the story",
      category: "land",
      pricingMode: "fixed",
      includes: ["Up to 10 exterior photos", "Up to 10 drone photos", "Neighborhood and lifestyle photos"],
      variants: [variant("location-package", "Location Package", 249, 60)],
    },
    preListing: {
      id: "preListing",
      name: "The Pre Listing Package",
      aryeoProductTitle: "Pre Listing Packages",
      purpose: "A complete exterior-first package for a coming-soon launch.",
      bestFor: "Capturing a property's exterior at its best before the full listing launch",
      category: "pre-listing",
      pricingMode: "fixed",
      includes: [
        "Up to 10 exterior photos",
        "Up to 10 drone photos",
        "Neighborhood and lifestyle photos",
        "Exterior ground and drone video clips",
        "Virtual twilight",
      ],
      variants: [variant("pre-listing-package", "The Pre Listing Package", 349, 120)],
    },
    exteriorPhotos: {
      id: "exteriorPhotos",
      name: "Exterior Photos",
      aryeoProductTitle: "Pre Listing Packages",
      purpose: "A focused exterior photo set for an early listing preview.",
      bestFor: "Simple coming-soon coverage before the full media appointment",
      category: "pre-listing",
      pricingMode: "fixed",
      includes: ["Up to 10 exterior photos"],
      photoCount: "Up to 10 photos",
      variants: [variant("exterior-photos", "Exterior Photos", 89, 20)],
    },
  },
};

export const ADD_ONS = {
  classicVideo: {
    id: "classicVideo",
    name: "Classic Video",
    aryeoProductTitle: "Video À la carte",
    purpose: "Choose a clean horizontal walkthrough or vertical reel.",
    priceLabel: "Final price pending",
    aryeoType: "MAIN",
  },
  luxeVideo: {
    id: "luxeVideo",
    name: "Luxe Video",
    aryeoProductTitle: "Video À la carte",
    purpose: "Choose horizontal or vertical with upgraded effects, transitions, and drone clips.",
    priceLabel: "Final price pending",
    aryeoType: "MAIN",
  },
  influencerVideo: {
    id: "influencerVideo",
    name: "Influencer Video",
    aryeoProductTitle: "Video À la carte",
    purpose: "Choose horizontal or vertical with agent, neighborhood, and lifestyle scenes.",
    priceLabel: "Final price pending",
    aryeoType: "MAIN",
  },
  luxeBoost: {
    id: "luxeBoost",
    name: "Luxe Boost",
    aryeoProductTitle: "Video Add Ons",
    purpose: "Add drone clips to a compatible video.",
    price: 75,
    aryeoType: "ADDON",
  },
  agentScenes: {
    id: "agentScenes",
    name: "Agent Scenes",
    aryeoProductTitle: "Video Add Ons",
    purpose: "Add agent-hosted scenes to a compatible video or reel.",
    price: 99,
    aryeoType: "ADDON",
  },
  socialBoost: {
    id: "socialBoost",
    name: "Social Boost",
    aryeoProductTitle: "Video Add Ons",
    purpose: "Add both drone and agent scenes to a compatible video.",
    price: 129,
    aryeoType: "ADDON",
  },
  droneCombo: {
    id: "droneCombo",
    name: "Aerial Photos + Video",
    aryeoProductTitle: "Aerial Services À la carte",
    purpose: "Add aerial photo and edited aerial video coverage.",
    priceLabel: "Confirm before launch",
    aryeoType: "MAIN",
  },
  twilightShoot: {
    id: "twilightShoot",
    name: "Twilight Shoot",
    aryeoProductTitle: "Twilight",
    purpose: "Add a dedicated twilight visit for a stronger hero image.",
    priceLabel: "Confirm before launch",
    aryeoType: "MAIN",
  },
  virtualStaging: {
    id: "virtualStaging",
    name: "Virtual Staging",
    aryeoProductTitle: "Virtual Staging",
    purpose: "Stage an empty room digitally.",
    priceLabel: "Confirm before launch",
    aryeoType: "ADDON",
  },
} satisfies Record<string, AddOnConfig>;

export function isPackageId(value: unknown): value is PackageId {
  return typeof value === "string" && Object.prototype.hasOwnProperty.call(PACKAGE_CONFIG.packages, value);
}

export function getCatalogVariant(packageId: PackageId, variantKey: string): CatalogVariant | undefined {
  return PACKAGE_CONFIG.packages[packageId].variants.find((item) => item.key === variantKey);
}

export function getDefaultCatalogVariant(packageId: PackageId): CatalogVariant {
  return PACKAGE_CONFIG.packages[packageId].variants[0];
}

export function getPackagePricingForSize(packageConfig: PackageConfig, size: SizeTier = "not_sure") {
  if (packageConfig.pricingMode === "square-footage") {
    const requestedKey = size === "not_sure" ? SIZE_TIER_CONFIG[0].key : size;
    const selectedVariant = packageConfig.variants.find((item) => item.key === requestedKey) || packageConfig.variants[0];
    return {
      price: selectedVariant.price,
      photos: selectedVariant.photoCount || packageConfig.photoCount,
      isStarting: size === "not_sure",
      variant: selectedVariant,
    };
  }

  const selectedVariant = packageConfig.variants[0];
  return {
    price: selectedVariant.price,
    photos: selectedVariant.photoCount || packageConfig.photoCount,
    isStarting: packageConfig.pricingMode === "tiered",
    variant: selectedVariant,
  };
}
