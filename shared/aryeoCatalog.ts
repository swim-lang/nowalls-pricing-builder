export const ARYEO_CATALOG_REVIEWED_AT = "2026-09-02";
export const ARYEO_ORDER_FORM_ID = "019cabc9-1539-7102-892e-6368f97d965b";
export const ARYEO_ORDER_FORM_URL = `https://nowalls.aryeo.com/order-forms/${ARYEO_ORDER_FORM_ID}`;

export type PackageId =
  | "starter"
  | "essentials"
  | "signature"
  | "premier"
  | "casualScroller"
  | "contentPro"
  | "influencer"
  | "landPackage"
  | "lot"
  | "locationPackage"
  | "preListing"
  | "exteriorPhotos";

export type PackageCategory = "core" | "social" | "land" | "pre-listing";

export type CatalogVariant = {
  key: string;
  label: string;
  price: number;
  durationMinutes: number;
};

export type PackageConfig = {
  id: PackageId;
  name: string;
  aryeoProductTitle: string;
  purpose: string;
  bestFor: string;
  category: PackageCategory;
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
  price: number;
  priceSuffix?: string;
  aryeoType: "MAIN" | "ADDON";
};

const variant = (key: string, label: string, price: number, durationMinutes: number): CatalogVariant => ({
  key,
  label,
  price,
  durationMinutes,
});

export const PACKAGE_CONFIG: { packages: Record<PackageId, PackageConfig> } = {
  packages: {
    starter: {
      id: "starter",
      name: "Starter",
      aryeoProductTitle: "Starter Package",
      purpose: "Simple listing coverage with the essentials handled.",
      bestFor: "Smaller listings and quick-turn properties that still need polish",
      category: "core",
      includes: ["Up to 25 professional photos", "2D floor plan", "Listing website + marketing kit"],
      photoCount: "Up to 25 photos",
      variants: [variant("starter", "Starter Package", 209, 30)],
    },
    essentials: {
      id: "essentials",
      name: "Essentials",
      aryeoProductTitle: "Essentials Package",
      purpose: "The go-to package for agents who want to market with intention.",
      bestFor: "Standard listings that need a polished, versatile launch",
      category: "core",
      includes: [
        "Up to 35 professional photos",
        "One selected enhancement: horizontal video, vertical reel, Zillow 3D, or Matterport 3D",
        "2D floor plan",
        "Virtual twilight",
        "Listing website + marketing kit",
      ],
      photoCount: "Up to 35 photos",
      selectionHint: "Choose the included video, reel, or 3D option you want to book.",
      variants: [
        variant("horizontal-video", "With Horizontal Video", 495, 120),
        variant("vertical-reel", "With Vertical Reel", 495, 120),
        variant("zillow-3d", "With Zillow ShowingTime+ 3D Tour", 495, 120),
        variant("matterport-3d", "With 3D Matterport Tour", 495, 120),
      ],
    },
    signature: {
      id: "signature",
      name: "Signature",
      aryeoProductTitle: "Signature Package",
      purpose: "An immersive package designed to help higher-end homes make a stronger first impression.",
      bestFor: "Listings that need cinematic depth and a stronger launch",
      category: "core",
      includes: [
        "Up to 40 professional photos",
        "Luxe cinematic video or luxe vertical reel",
        "Zillow ShowingTime+ 3D or Matterport 3D",
        "Up to 8 aerial photos + video",
        "2D floor plan",
        "Virtual twilight",
        "Listing website + marketing kit",
      ],
      photoCount: "Up to 40 photos",
      selectionHint: "Choose a video style and a 3D-tour provider.",
      variants: [
        variant("video-zillow", "Luxe Video + Zillow ShowingTime+ 3D", 749, 180),
        variant("video-matterport", "Luxe Video + Matterport 3D", 749, 180),
        variant("reel-zillow", "Luxe Reel + Zillow ShowingTime+ 3D", 749, 180),
        variant("reel-matterport", "Luxe Reel + Matterport 3D", 749, 180),
      ],
    },
    premier: {
      id: "premier",
      name: "Premier",
      aryeoProductTitle: "Premier Package",
      purpose: "A complete package built to elevate a listing and boost buyer interest.",
      bestFor: "Luxury, high-value, and story-driven properties",
      category: "core",
      includes: [
        "Up to 45 professional photos",
        "Luxe cinematic video",
        "Luxe vertical reel",
        "Up to 10 aerial photos + video",
        "Zillow ShowingTime+ 3D or Matterport 3D",
        "2D floor plan",
        "Virtual twilight",
        "Listing website + marketing kit",
      ],
      photoCount: "Up to 45 photos",
      selectionHint: "Choose the 3D-tour provider you want to book.",
      variants: [
        variant("zillow-3d", "With Zillow ShowingTime+ 3D", 1195, 240),
        variant("matterport-3d", "With 3D Matterport", 1195, 240),
      ],
    },
    casualScroller: {
      id: "casualScroller",
      name: "The Casual Scroller",
      aryeoProductTitle: "Listing + Social Media Packages",
      purpose: "A social-ready package that gives a listing an easy content boost.",
      bestFor: "Agents who want polished listing media and a classic reel",
      category: "social",
      includes: [
        "Up to 30 professional photos",
        "Classic vertical reel",
        "Coming soon video",
        "2D floor plan",
        "Listing website + marketing kit",
      ],
      photoCount: "Up to 30 photos",
      variants: [variant("casual-scroller", "The Casual Scroller", 395, 60)],
    },
    contentPro: {
      id: "contentPro",
      name: "The Content Pro",
      aryeoProductTitle: "Listing + Social Media Packages",
      purpose: "A complete listing-and-content package with higher-production social assets.",
      bestFor: "Agents who want the listing to consistently feed their content channels",
      category: "social",
      includes: [
        "Up to 35 professional photos",
        "Luxe vertical reel with drone clips",
        "Coming soon video",
        "Up to 10 aerial photos + video clips for the reel",
        "2D floor plan",
        "Listing website + marketing kit",
      ],
      photoCount: "Up to 35 photos",
      variants: [variant("content-pro", "The Content Pro", 595, 90)],
    },
    influencer: {
      id: "influencer",
      name: "The Influencer",
      aryeoProductTitle: "Listing + Social Media Packages",
      purpose: "The full personal-brand package with agent and lifestyle scenes.",
      bestFor: "Agents making personal brand growth a major part of the listing strategy",
      category: "social",
      includes: [
        "Up to 40 professional photos",
        "Influencer reel with agent and lifestyle scenes",
        "Coming soon video",
        "Up to 10 aerial photos + video clips for the reel",
        "2D floor plan",
        "Listing website + marketing kit",
      ],
      photoCount: "Up to 40 photos",
      variants: [variant("influencer", "The Influencer", 695, 120)],
    },
    landPackage: {
      id: "landPackage",
      name: "Land Package",
      aryeoProductTitle: "Land Package",
      purpose: "Full visual context for land, lots, and acreage.",
      bestFor: "Land listings where boundaries, access, and neighborhood context matter",
      category: "land",
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
      includes: ["Up to 10 exterior photos"],
      photoCount: "Up to 10 photos",
      variants: [variant("exterior-photos", "Exterior Photos", 89, 20)],
    },
  },
};

export const ADD_ONS = {
  classicVideo: {
    id: "classicVideo",
    name: "Walkthrough Video",
    aryeoProductTitle: "Video À la carte",
    purpose: "Add a clean horizontal walkthrough video.",
    price: 249,
    aryeoType: "MAIN",
  },
  classicReel: {
    id: "classicReel",
    name: "Classic Reel",
    aryeoProductTitle: "Reels For Social Media (Vertical Video) À la carte",
    purpose: "Add a social-ready vertical reel.",
    price: 195,
    aryeoType: "MAIN",
  },
  contentSpecialist: {
    id: "contentSpecialist",
    name: "Content Specialist",
    aryeoProductTitle: "Reels For Social Media (Vertical Video) À la carte",
    purpose: "Add a higher-production vertical reel with effects and drone clips.",
    price: 289,
    aryeoType: "MAIN",
  },
  influencerReel: {
    id: "influencerReel",
    name: "The Influencer",
    aryeoProductTitle: "Reels For Social Media (Vertical Video) À la carte",
    purpose: "Add agent and lifestyle scenes to support the agent's brand.",
    price: 329,
    aryeoType: "MAIN",
  },
  droneCombo: {
    id: "droneCombo",
    name: "Photos and Video (aerial only)",
    aryeoProductTitle: "Aerial Services À la carte",
    purpose: "Add aerial photo and edited aerial video coverage.",
    price: 200,
    aryeoType: "MAIN",
  },
  twilightShoot: {
    id: "twilightShoot",
    name: "Twilight Shoot",
    aryeoProductTitle: "Twilight",
    purpose: "Add a dedicated twilight visit for a stronger hero image.",
    price: 149,
    aryeoType: "MAIN",
  },
  virtualStaging: {
    id: "virtualStaging",
    name: "Virtual Staging",
    aryeoProductTitle: "Virtual Staging",
    purpose: "Stage an empty room digitally.",
    price: 39,
    priceSuffix: " / image",
    aryeoType: "ADDON",
  },
  agentScenes: {
    id: "agentScenes",
    name: "Agent Scenes",
    aryeoProductTitle: "Video Add Ons",
    purpose: "Add agent-hosted scenes to a compatible video or reel.",
    price: 79,
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
