import { ReactNode, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  CircleDollarSign,
  Film,
  Home,
  Image,
  Layers3,
  Map,
  RotateCcw,
  Sparkles,
} from "lucide-react";

type QuestionId = "propertyType" | "goal" | "socialImportance" | "size" | "knownNeeds";
type PriceSizeTier =
  | "under_1000"
  | "1001_2000"
  | "2001_3000"
  | "3001_4000"
  | "4000_6000"
  | "6001_8000"
  | "over_8000";
type SizeTier = PriceSizeTier | "not_sure";
type PackageId =
  | "starter"
  | "essentials"
  | "signature"
  | "premier"
  | "casualScroller"
  | "contentPro"
  | "influencer"
  | "airbnbHost"
  | "airbnbHostPlus"
  | "airbnbSuperHost"
  | "airbnbSuperHostPlus"
  | "landPackage"
  | "lot"
  | "locationPackage"
  | "preListing";

type Option = {
  id: string;
  label: string;
  hint?: string;
};

type QuestionConfig = {
  id: QuestionId;
  eyebrow: string;
  question: string;
  multiple?: boolean;
  options: Option[];
};

type PackageConfig = {
  id: PackageId;
  name: string;
  purpose: string;
  bestFor: string;
  category: "core" | "social" | "airbnb" | "land" | "pre-listing";
  includes: string[];
  pricing?: Partial<Record<PriceSizeTier, { price: number; photos?: string }>>;
  flatPrice?: number;
};

type AddOnConfig = {
  id: string;
  name: string;
  purpose: string;
  price: number;
  priceSuffix?: string;
};

type Answers = Partial<Record<QuestionId, string | string[]>>;

type Recommendation = {
  package: PackageConfig;
  reason: string;
  addOns: AddOnConfig[];
  estimatedPrice: number;
  isStartingPrice: boolean;
  photoCount?: string;
  sizeLabel: string;
};

const cx = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(" ");
const NO_WALLS_FAVICON_URL = "https://framerusercontent.com/images/LPlC9tqmKBjfv4PD9XJCmiZDn9s.png";

const iconMap = {
  home: Home,
  image: Image,
  film: Film,
  map: Map,
  layers: Layers3,
  sparkles: Sparkles,
};

const PRICE_SIZE_TIERS: PriceSizeTier[] = [
  "under_1000",
  "1001_2000",
  "2001_3000",
  "3001_4000",
  "4000_6000",
  "6001_8000",
  "over_8000",
];

const SIZE_LABELS: Record<SizeTier, string> = {
  under_1000: "0-1,000 sq ft",
  "1001_2000": "1,001-2,000 sq ft",
  "2001_3000": "2,001-3,000 sq ft",
  "3001_4000": "3,001-4,000 sq ft",
  "4000_6000": "4,000-6,000 sq ft",
  "6001_8000": "6,001-8,000 sq ft",
  over_8000: "8,000+ sq ft",
  not_sure: "Square footage not selected",
};

const tier = (price: number, photos: number) => ({ price, photos: `${photos} photos` });

export const PACKAGE_CONFIG = {
  packages: {
    starter: {
      id: "starter",
      name: "Starter",
      purpose: "Simple listing, lower budget, essential photos.",
      bestFor: "Smaller listings and quick-turn properties that still need polish",
      category: "core",
      includes: ["Professional photos", "Agent-branded property website", "2D floor plan"],
      pricing: {
        under_1000: tier(195, 25),
        "1001_2000": tier(229, 30),
        "2001_3000": tier(265, 35),
        "3001_4000": tier(300, 40),
        "4000_6000": tier(335, 45),
        "6001_8000": tier(370, 50),
        over_8000: tier(405, 55),
      },
    },
    essentials: {
      id: "essentials",
      name: "Essentials",
      purpose: "The go-to package for agents who want to market with intention.",
      bestFor: "Standard listings that need a polished, versatile launch",
      category: "core",
      includes: [
        "Professional photos",
        "Classic video walkthrough or classic vertical reel",
        "Matterport or Zillow 3D",
        "2D floor plan",
        "Virtual twilight",
        "Agent-branded property website + marketing kit",
      ],
      pricing: {
        under_1000: tier(460, 30),
        "1001_2000": tier(495, 35),
        "2001_3000": tier(530, 40),
        "3001_4000": tier(565, 45),
        "4000_6000": tier(600, 50),
        "6001_8000": tier(635, 55),
        over_8000: tier(670, 60),
      },
    },
    signature: {
      id: "signature",
      name: "Signature",
      purpose: "An immersive package designed to sell high-end homes faster and for more.",
      bestFor: "Listings that need cinematic depth and a stronger launch",
      category: "core",
      includes: [
        "Professional photos",
        "Luxe cinematic video or luxe cinematic reel",
        "Zillow ShowingTime+ 3D tour or Matterport tour",
        "Up to 10 aerial drone photos + video",
        "2D floor plan",
        "Virtual twilight",
        "Agent-branded property website + marketing kit",
      ],
      pricing: {
        under_1000: tier(714, 30),
        "1001_2000": tier(749, 35),
        "2001_3000": tier(784, 40),
        "3001_4000": tier(819, 45),
        "4000_6000": tier(854, 50),
        "6001_8000": tier(889, 55),
        over_8000: tier(924, 60),
      },
    },
    premier: {
      id: "premier",
      name: "Premier",
      purpose: "A complete package built to elevate a listing and boost buyer interest.",
      bestFor: "Luxury, high-value, and story-driven properties",
      category: "core",
      includes: [
        "Professional photos",
        "Luxe cinematic video",
        "Luxe cinematic reel",
        "Up to 10 aerial drone photos + video",
        "Zillow ShowingTime+ 3D tour or Matterport tour",
        "2D floor plan",
        "Virtual twilight",
        "Agent-branded property website + marketing kit",
      ],
      pricing: {
        under_1000: tier(990, 30),
        "1001_2000": tier(1025, 35),
        "2001_3000": tier(1060, 40),
        "3001_4000": tier(1095, 45),
        "4000_6000": tier(1130, 50),
        "6001_8000": tier(1165, 55),
        over_8000: tier(1200, 60),
      },
    },
    casualScroller: {
      id: "casualScroller",
      name: "The Casual Scroller",
      purpose: "A social-ready package that gives a listing an easy content boost.",
      bestFor: "Agents who want polished listing media and a classic reel",
      category: "social",
      includes: [
        "Professional horizontal and vertical photos",
        "Classic vertical reel",
        "2D floor plan",
        "Virtual twilight",
        "Agent-branded property website + marketing kit",
      ],
      pricing: {
        under_1000: tier(395, 30),
        "1001_2000": tier(430, 35),
        "2001_3000": tier(465, 40),
        "3001_4000": tier(500, 45),
        "4000_6000": tier(535, 50),
        "6001_8000": tier(570, 55),
        over_8000: tier(605, 60),
      },
    },
    contentPro: {
      id: "contentPro",
      name: "The Content Pro",
      purpose: "A complete listing-and-content package with higher-production social assets.",
      bestFor: "Agents who want the listing to consistently feed their content channels",
      category: "social",
      includes: [
        "Professional horizontal and vertical photos",
        "Luxe vertical reel with drone clips",
        "Coming soon video",
        "Up to 10 aerial photos + video",
        "2D floor plan",
        "Virtual twilight",
        "Agent-branded property website + marketing kit",
      ],
      pricing: {
        under_1000: tier(595, 30),
        "1001_2000": tier(630, 35),
        "2001_3000": tier(665, 40),
        "3001_4000": tier(700, 45),
        "4000_6000": tier(735, 50),
        "6001_8000": tier(770, 55),
        over_8000: tier(805, 60),
      },
    },
    influencer: {
      id: "influencer",
      name: "The Influencer",
      purpose: "The full personal-brand package with agent and lifestyle scenes.",
      bestFor: "Agents making personal brand growth a major part of the listing strategy",
      category: "social",
      includes: [
        "Professional horizontal and vertical photos",
        "Influencer vertical reel with agent/lifestyle scenes",
        "Coming soon video",
        "Up to 10 aerial photos + video",
        "Zillow ShowingTime+ or Matterport 3D",
        "2D floor plan",
        "Virtual twilight",
        "Agent-branded property website + marketing kit",
      ],
      pricing: {
        under_1000: tier(695, 30),
        "1001_2000": tier(730, 35),
        "2001_3000": tier(765, 40),
        "3001_4000": tier(800, 45),
        "4000_6000": tier(835, 50),
        "6001_8000": tier(870, 55),
        over_8000: tier(905, 60),
      },
    },
    airbnbHost: {
      id: "airbnbHost",
      name: "Host Package",
      purpose: "Clean, detail-focused coverage for a short-term rental.",
      bestFor: "Hosts who need a polished foundational photo set",
      category: "airbnb",
      includes: ["Up to 35 professional photos", "Detail photos of staged items and property features"],
      flatPrice: 295,
    },
    airbnbHostPlus: {
      id: "airbnbHostPlus",
      name: "Host Package Plus",
      purpose: "Expanded rental coverage with neighborhood context and light staging.",
      bestFor: "Hosts who want the property and its location to feel fully considered",
      category: "airbnb",
      includes: ["Up to 40 professional photos", "Detail photos", "Neighborhood/lifestyle shots", "Drone photos", "Light staging"],
      flatPrice: 395,
    },
    airbnbSuperHost: {
      id: "airbnbSuperHost",
      name: "Super Host Package",
      purpose: "A richer short-term rental launch with social video.",
      bestFor: "Established hosts who market beyond the booking platform",
      category: "airbnb",
      includes: ["Up to 50 professional photos", "Detail photos", "Neighborhood/lifestyle shots", "Drone photos", "Light staging", "Vertical social reel"],
      flatPrice: 495,
    },
    airbnbSuperHostPlus: {
      id: "airbnbSuperHostPlus",
      name: "Super Host Package Plus",
      purpose: "The complete short-term rental package with reel and 3D tour.",
      bestFor: "Premium rentals that need maximum visual coverage",
      category: "airbnb",
      includes: ["Up to 50 professional photos", "Detail photos", "Neighborhood/lifestyle shots", "Drone photos", "Light staging", "Vertical social reel", "3D tour"],
      flatPrice: 595,
    },
    landPackage: {
      id: "landPackage",
      name: "Land Package",
      purpose: "Full visual context for land, lots, and acreage.",
      bestFor: "Land listings where boundaries, access, and neighborhood context matter",
      category: "land",
      includes: ["Up to 20 ground photos", "10-15 drone photos with boundary graphics", "Neighborhood photos", "Drone video with boundary lines", "Neighborhood/lifestyle video clips"],
      flatPrice: 499,
    },
    lot: {
      id: "lot",
      name: "The Lot",
      purpose: "A compact photo package for a straightforward lot listing.",
      bestFor: "Lots that need clean ground and aerial coverage",
      category: "land",
      includes: ["Up to 10 exterior photos", "Up to 10 drone photos", "Agent-branded property website"],
      flatPrice: 249,
    },
    locationPackage: {
      id: "locationPackage",
      name: "Location Package",
      purpose: "A land package that adds neighborhood and lifestyle context.",
      bestFor: "Location-driven lots where the surrounding area helps sell the story",
      category: "land",
      includes: ["Up to 10 exterior photos", "Up to 10 drone photos", "Neighborhood/lifestyle photos", "Agent-branded property website"],
      flatPrice: 349,
    },
    preListing: {
      id: "preListing",
      name: "Pre-Listing Package",
      purpose: "Exterior photos and video clips before the property is ready to list.",
      bestFor: "Capturing a property's exterior at its best before the full listing launch",
      category: "pre-listing",
      includes: ["Exterior photos", "Exterior video clips"],
      flatPrice: 129,
    },
  } satisfies Record<PackageId, PackageConfig>,
};

const ADD_ONS = {
  classicVideo: { id: "classicVideo", name: "Classic Walkthrough Video", purpose: "Add a clean horizontal walkthrough video.", price: 249 },
  classicReel: { id: "classicReel", name: "Classic Reel", purpose: "Add a social-ready vertical reel.", price: 189 },
  contentSpecialist: { id: "contentSpecialist", name: "Content Specialist Reel", purpose: "Add a higher-production vertical reel with effects and drone clips.", price: 289 },
  influencerReel: { id: "influencerReel", name: "Influencer Reel", purpose: "Add agent and lifestyle scenes to fully support the agent's brand.", price: 389 },
  droneCombo: { id: "droneCombo", name: "Drone Photo + Video Combo", purpose: "Add aerial photo and edited aerial video coverage.", price: 199 },
  twilightShoot: { id: "twilightShoot", name: "Twilight Shoot", purpose: "Add a dedicated twilight visit for a stronger hero image.", price: 159 },
  virtualStaging: { id: "virtualStaging", name: "Virtual Staging", purpose: "Stage an empty room digitally.", price: 39, priceSuffix: " / image" },
  agentScenes: { id: "agentScenes", name: "Agent Scenes", purpose: "Add agent-hosted scenes to the selected video.", price: 99 },
} satisfies Record<string, AddOnConfig>;

export const QUESTION_CONFIG: QuestionConfig[] = [
  {
    id: "propertyType",
    eyebrow: "Property",
    question: "What kind of property are you marketing?",
    options: [
      { id: "standard", label: "Standard residential listing", hint: "A typical home, condo, or townhome." },
      { id: "luxury", label: "Luxury or high-value listing", hint: "A premium property where presentation carries more weight." },
      { id: "land", label: "Land, lot, or acreage", hint: "A property where boundaries, access, and context matter." },
      { id: "short_term_rental", label: "Airbnb or short-term rental", hint: "A furnished rental where details and lifestyle coverage matter." },
      { id: "pre_listing", label: "Pre-listing / coming soon content", hint: "Early launch assets before the full listing push." },
      { id: "not_sure", label: "I'm not sure yet", hint: "No problem. We'll keep the recommendation flexible." },
    ],
  },
  {
    id: "goal",
    eyebrow: "Goal",
    question: "What are you trying to accomplish?",
    options: [
      { id: "essentials_only", label: "I just need the essentials", hint: "Clean, simple media for the listing." },
      { id: "polished", label: "I want the listing to look polished and professional", hint: "A balanced package with strong basics." },
      { id: "sell_fast", label: "I need to sell this fast", hint: "More media depth to help the listing move." },
      { id: "premium", label: "I want this listing to feel premium", hint: "A higher-touch presentation for a stronger first impression." },
      { id: "personal_brand", label: "I want content that also builds my personal brand", hint: "Listing media plus agent-facing social assets." },
      { id: "custom", label: "I want something more custom", hint: "A flexible recommendation with room to tailor production." },
    ],
  },
  {
    id: "socialImportance",
    eyebrow: "Social",
    question: "How important is social content for this listing?",
    options: [
      { id: "not_important", label: "Not important, I just need listing media", hint: "Focus the package on MLS and listing presentation." },
      { id: "somewhat", label: "Somewhat important, I want a few usable assets", hint: "Add a light social layer." },
      { id: "very", label: "Very important, I want reels and content for my channels", hint: "Prioritize vertical and short-form deliverables." },
      { id: "major", label: "This is a major part of my marketing strategy", hint: "Build around listing impact and personal brand lift." },
    ],
  },
  {
    id: "size",
    eyebrow: "Size",
    question: "What is the approximate property size?",
    options: [
      { id: "under_1000", label: "0 to 1,000 sq ft", hint: "Compact property." },
      { id: "1001_2000", label: "1,001 to 2,000 sq ft", hint: "Small to mid-size property." },
      { id: "2001_3000", label: "2,001 to 3,000 sq ft", hint: "Mid-size listing." },
      { id: "3001_4000", label: "3,001 to 4,000 sq ft", hint: "Larger property." },
      { id: "4000_6000", label: "4,000 to 6,000 sq ft", hint: "Large property with more coverage needs." },
      { id: "6001_8000", label: "6,001 to 8,000 sq ft", hint: "Estate-scale property." },
      { id: "over_8000", label: "Over 8,000 sq ft", hint: "Maximum standard coverage tier." },
      { id: "not_sure", label: "Not sure", hint: "We'll keep the estimate flexible." },
    ],
  },
  {
    id: "knownNeeds",
    eyebrow: "Needs",
    question: "What do you already know you need?",
    multiple: true,
    options: [
      { id: "photos", label: "Photos" },
      { id: "video", label: "Video" },
      { id: "drone", label: "Drone" },
      { id: "3d_tour", label: "Matterport or Zillow 3D" },
      { id: "floor_plan", label: "Floor plan" },
      { id: "website", label: "Website" },
      { id: "social_reels", label: "Social reels" },
      { id: "twilight", label: "Twilight or virtual twilight" },
      { id: "neighborhood", label: "Neighborhood / lifestyle content" },
      { id: "recommend", label: "Not sure, recommend it for me" },
    ],
  },
];

const PACKAGE_ICONS: Record<PackageId, keyof typeof iconMap> = {
  starter: "image",
  essentials: "home",
  signature: "film",
  premier: "sparkles",
  casualScroller: "film",
  contentPro: "film",
  influencer: "sparkles",
  airbnbHost: "home",
  airbnbHostPlus: "home",
  airbnbSuperHost: "sparkles",
  airbnbSuperHostPlus: "sparkles",
  landPackage: "map",
  lot: "map",
  locationPackage: "map",
  preListing: "layers",
};

const getPackage = (id: PackageId) => PACKAGE_CONFIG.packages[id];
const getSingleAnswer = (answers: Answers, id: QuestionId) => answers[id] as string | undefined;
const getMultiAnswer = (answers: Answers, id: QuestionId) => {
  const value = answers[id];
  return Array.isArray(value) ? value : [];
};

const answerLabel = (questionId: QuestionId, value: string) => {
  const question = QUESTION_CONFIG.find((item) => item.id === questionId);
  return question?.options.find((option) => option.id === value)?.label ?? value;
};

const formatPrice = (price: number, isStarting = false) => `${isStarting ? "Starting at " : ""}$${price.toLocaleString()}`;

export function getPackagePricing(packageConfig: PackageConfig, size: SizeTier = "not_sure") {
  if (packageConfig.flatPrice !== undefined) {
    return { price: packageConfig.flatPrice, photos: undefined, isStarting: false };
  }

  const selectedTier = size === "not_sure" ? PRICE_SIZE_TIERS[0] : size;
  const pricing = packageConfig.pricing?.[selectedTier] ?? packageConfig.pricing?.[PRICE_SIZE_TIERS[0]];
  if (!pricing) throw new Error(`Missing pricing for ${packageConfig.name}`);
  return { ...pricing, isStarting: size === "not_sure" };
}

const packageIncludesDrone = (packageId: PackageId) => [
  "signature",
  "premier",
  "contentPro",
  "influencer",
  "airbnbHostPlus",
  "airbnbSuperHost",
  "airbnbSuperHostPlus",
  "landPackage",
].includes(packageId);

const packageIncludesVideo = (packageId: PackageId) => [
  "essentials",
  "signature",
  "premier",
  "casualScroller",
  "contentPro",
  "influencer",
  "airbnbSuperHost",
  "airbnbSuperHostPlus",
  "landPackage",
  "preListing",
].includes(packageId);

const packageIncludesTwilight = (packageId: PackageId) => ["essentials", "signature", "premier", "casualScroller", "contentPro", "influencer"].includes(packageId);

export function getRecommendation(answers: Answers): Recommendation {
  const propertyType = getSingleAnswer(answers, "propertyType");
  const goal = getSingleAnswer(answers, "goal");
  const socialImportance = getSingleAnswer(answers, "socialImportance");
  const size = getSingleAnswer(answers, "size");
  const knownNeeds = getMultiAnswer(answers, "knownNeeds");
  const needsSet = new Set(knownNeeds);

  let packageId: PackageId = "essentials";
  let reason = "This gives you a polished listing presence without overbuilding the production.";

  if (propertyType === "land") {
    packageId = goal === "essentials_only" ? "lot" : goal === "polished" ? "locationPackage" : "landPackage";
    reason = "Land listings benefit from drone context, boundary graphics, and access imagery more than a standard interior-first package.";
  } else if (propertyType === "short_term_rental") {
    if (goal === "premium" || goal === "custom" || socialImportance === "major") {
      packageId = "airbnbSuperHostPlus";
      reason = "This gives a premium rental the fullest photo, lifestyle, social, and 3D coverage.";
    } else if (goal === "personal_brand" || socialImportance === "very") {
      packageId = "airbnbSuperHost";
      reason = "This adds social video and broader visual coverage to the short-term rental launch.";
    } else if (goal === "polished" || goal === "sell_fast" || socialImportance === "somewhat") {
      packageId = "airbnbHostPlus";
      reason = "This adds neighborhood, drone, and styling context to a polished rental listing.";
    } else {
      packageId = "airbnbHost";
      reason = "This keeps the rental coverage focused on strong photos and the details guests care about.";
    }
  } else if (propertyType === "pre_listing") {
    packageId = "preListing";
    reason = "A pre-listing package gives you strong coming-soon assets without waiting for the full listing launch.";
  } else if (propertyType === "luxury") {
    packageId = "premier";
    reason = "A higher-value listing needs a premium presentation with video, social assets, twilight, and lifestyle context.";
  } else if (goal === "essentials_only") {
    packageId = "starter";
    reason = "You asked for the essentials, so this keeps the recommendation simple and budget-conscious.";
  } else if (goal === "polished") {
    packageId = "essentials";
    reason = "This balances professional photos, video or 3D, floor plan, virtual twilight, and a polished web presence.";
  } else if (goal === "sell_fast") {
    packageId = "signature";
    reason = "A faster sale usually needs more visual depth, especially video, website, and social-friendly assets.";
  } else if (goal === "premium" || goal === "custom") {
    packageId = "premier";
    reason = "This gives the listing a fuller, more elevated media story with room for custom production needs.";
  } else if (goal === "personal_brand") {
    packageId = socialImportance === "major" ? "influencer" : "contentPro";
    reason = "You are marketing both the property and your brand, so the recommendation centers social-ready video and agent-facing content.";
  }

  const highIntentNeeds = ["video", "drone", "website", "social_reels"].filter((need) => needsSet.has(need));
  if (!["land", "short_term_rental", "pre_listing", "luxury"].includes(propertyType || "")) {
    if (socialImportance === "major") {
      packageId = "influencer";
      reason = "Social is a major part of your strategy, so this package adds agent and lifestyle scenes to the listing campaign.";
    } else if (goal === "personal_brand" || socialImportance === "very") {
      packageId = "contentPro";
      reason = "Your answers call for a listing package that consistently creates higher-production social content.";
    } else if (highIntentNeeds.length >= 4) {
      packageId = "premier";
      reason = "Your answers point to a more complete launch with video, drone, web, and social content working together.";
    } else if (highIntentNeeds.length >= 3 && packageId !== "premier") {
      packageId = "signature";
      reason = "You selected several higher-impact deliverables, so Signature is the better fit than a basic package.";
    }
  }

  const recommendedPackage = getPackage(packageId);
  const addOns: AddOnConfig[] = [];
  if (recommendedPackage.category !== "social" && needsSet.has("social_reels")) {
    if (socialImportance === "major") addOns.push(ADD_ONS.influencerReel);
    else if (socialImportance === "very") addOns.push(ADD_ONS.contentSpecialist);
    else addOns.push(ADD_ONS.classicReel);
  }

  if (needsSet.has("video") && !packageIncludesVideo(packageId)) addOns.push(ADD_ONS.classicVideo);
  if (needsSet.has("drone") && !packageIncludesDrone(packageId)) addOns.push(ADD_ONS.droneCombo);
  if (needsSet.has("twilight") && !packageIncludesTwilight(packageId)) addOns.push(ADD_ONS.twilightShoot);
  if (goal === "personal_brand" && recommendedPackage.category === "core") addOns.push(ADD_ONS.agentScenes);
  if (goal === "custom" && !needsSet.has("twilight")) addOns.push(ADD_ONS.virtualStaging);

  const selectedSize = (size ?? "not_sure") as SizeTier;
  const packagePricing = getPackagePricing(recommendedPackage, selectedSize);

  return {
    package: recommendedPackage,
    reason,
    addOns: dedupeAddOns(addOns),
    estimatedPrice: packagePricing.price,
    isStartingPrice: packagePricing.isStarting,
    photoCount: packagePricing.photos,
    sizeLabel: SIZE_LABELS[selectedSize],
  };
}

function dedupeAddOns(addOns: AddOnConfig[]) {
  const seen = new Set<string>();
  return addOns.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

export default function PricingBuilder() {
  const [stepIndex, setStepIndex] = useState(-1);
  const [answers, setAnswers] = useState<Answers>({});

  const currentQuestion = QUESTION_CONFIG[stepIndex];
  const isIntro = stepIndex === -1;
  const isRecommendation = stepIndex >= QUESTION_CONFIG.length;
  const answeredSteps = QUESTION_CONFIG.filter((question) => {
    const value = answers[question.id];
    return Array.isArray(value) ? value.length > 0 : Boolean(value);
  }).length;

  const recommendation = useMemo(() => getRecommendation(answers), [answers]);

  const startOver = () => {
    setAnswers({});
    setStepIndex(-1);
  };

  const updateAnswer = (questionId: QuestionId, value: string | string[]) => {
    setAnswers((current) => ({ ...current, [questionId]: value }));
  };

  return (
    <section className="min-h-screen overflow-hidden bg-[#f1f1f1] text-[#111011]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_28%_18%,rgba(255,255,255,0.95),transparent_44%),linear-gradient(135deg,rgba(214,219,220,0.62),rgba(241,241,241,0))]" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <Header showStartOver={!isIntro} onStartOver={startOver} />

        <main className="flex flex-1 items-center py-8 sm:py-12">
          <div className="w-full">
            {isIntro && <IntroScreen onStart={() => setStepIndex(0)} />}

            {!isIntro && !isRecommendation && currentQuestion && (
              <div className="mx-auto max-w-4xl animate-fade-up">
                <ProgressBar current={stepIndex + 1} total={QUESTION_CONFIG.length} answered={answeredSteps} />
                <QuestionShell
                  onBack={() => setStepIndex((current) => Math.max(-1, current - 1))}
                  canContinue={currentQuestion.multiple}
                  onContinue={() => setStepIndex((current) => current + 1)}
                  answers={answers}
                >
                  {currentQuestion.multiple ? (
                    <MultiSelectStep question={currentQuestion} answers={answers} onChange={updateAnswer} />
                  ) : (
                    <QuestionStep
                      question={currentQuestion}
                      value={getSingleAnswer(answers, currentQuestion.id)}
                      onSelect={(value) => {
                        updateAnswer(currentQuestion.id, value);
                        window.setTimeout(() => setStepIndex((current) => current + 1), 130);
                      }}
                    />
                  )}
                </QuestionShell>
              </div>
            )}

            {isRecommendation && (
              <RecommendationScreen
                answers={answers}
                recommendation={recommendation}
                onStartOver={startOver}
                onEdit={(questionId) => setStepIndex(QUESTION_CONFIG.findIndex((question) => question.id === questionId))}
              />
            )}
          </div>
        </main>
      </div>
    </section>
  );
}

function Header({ showStartOver, onStartOver }: { showStartOver: boolean; onStartOver: () => void }) {
  return (
    <header className="flex items-center justify-between gap-4 rounded-full border border-black/5 bg-white px-4 py-3 shadow-[0_16px_55px_rgba(0,0,0,0.06)]">
      <div className="flex min-w-0 items-center gap-4">
        <NoWallsLogo className="h-auto w-36 shrink-0 text-black sm:w-44" />
        <div className="hidden h-8 w-px bg-black/10 sm:block" />
        <p className="hidden text-sm font-semibold uppercase tracking-[0.16em] text-[#828487] sm:block">Package Builder</p>
      </div>
      {showStartOver && (
        <Button variant="ghost" className="h-10 px-3 text-sm" onClick={onStartOver}>
          <RotateCcw className="h-4 w-4" />
          Start fresh
        </Button>
      )}
    </header>
  );
}

function NoWallsLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 411.28 52.35" aria-label="No Walls" role="img">
      <path
        fill="currentColor"
        d="m86.6 1.23 20.59 29.38V1.23h10.66v50.4h-8.93L88.25 22.25v29.38H77.59V1.23h9Zm87.43 25.2c0 14.76-11.02 25.92-25.71 25.92s-25.71-11.16-25.71-25.92S133.63.51 148.32.51s25.71 11.16 25.71 25.92Zm-40.47 0c0 8.86 6.34 15.55 14.76 15.55s14.76-6.7 14.76-15.55-6.34-15.55-14.76-15.55-14.76 6.7-14.76 15.55Zm124.03-25.2-16.71 50.4h-8.64l-10.58-32.4-10.44 32.4h-8.71l-16.78-50.4h11.38l9.94 32.4 10.43-32.4h8.64l10.37 32.4 9.87-32.4h11.23Zm40.48 50.4h-11.59l-3.17-8.42h-19.44l-3.24 8.42h-11.31l20.02-50.4h8.64l20.09 50.4Zm-18.36-17.71-6.05-15.99-6.19 15.99h12.24Zm32.48-32.69v40.18h23.04v10.22h-33.7V1.23h10.66Zm36.95 0v40.18h23.04v10.22h-33.7V1.23h10.66Zm24.55 33.69h10.51c0 4.46 3.53 7.34 8.57 7.34 4.68 0 7.92-2.16 7.92-5.47 0-8.93-26.5-2.95-26.5-21.39 0-8.64 7.42-14.91 17.35-14.91 12.46 0 18.15 7.92 18.15 16.78h-11.02c-.07-3.82-2.88-6.7-7.49-6.7-4.03 0-6.55 1.8-6.55 4.75 0 8.35 26.64 2.23 26.64 21.46 0 8.93-7.85 15.55-18.51 15.55s-19.08-7.34-19.08-17.43ZM27.4 18.13l9.07 9.07L54.6 9.07 45.53 0l-9.07 9.07L27.38 0 9.25 18.13l9.08 9.07 9.07-9.07z"
      />
      <path
        fill="currentColor"
        d="m36.46 33.72-9.08-9.07-9.15 9.15-9.16-9.15L0 33.72l18.13 18.13.1-.1.1.1 9.07-9.07 9.07 9.07L54.6 33.72l-9.07-9.07-9.07 9.07z"
      />
    </svg>
  );
}

function IntroScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
      <div className="animate-fade-up">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold uppercase tracking-[0.12em] text-[#828487] shadow-sm">
          <Sparkles className="h-4 w-4 text-black" />
          Real Estate Marketing Done Differently
        </div>
        <h1 className="max-w-3xl text-5xl font-semibold leading-[1.02] tracking-normal text-[#111011] sm:text-6xl lg:text-7xl">
          Forget the pricing table. Build the right listing gameplan.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-[#606266] sm:text-xl">
          Answer a few quick questions and we'll recommend the package that fits the property, your goals, and the way you want buyers to feel.
        </p>
        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <Button size="lg" onClick={onStart}>
            Build my package
            <ArrowRight className="h-4 w-4" />
          </Button>
          <a
            href="#compare-preview"
            className="inline-flex h-14 items-center justify-center rounded-full border border-black/15 bg-white px-7 text-base font-medium text-[#111011] transition hover:bg-[#f7f7f7]"
          >
            Preview packages
          </a>
        </div>
      </div>

      <div id="compare-preview" className="rounded-[2rem] border border-white bg-white p-4 shadow-soft-xl">
        <div className="rounded-[1.5rem] border border-black/10 bg-[#111011] p-6 text-white">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm uppercase tracking-[0.2em] text-white/55">Recommendation preview</p>
            <img src={NO_WALLS_FAVICON_URL} alt="" className="h-8 w-8 rounded-lg bg-white" />
          </div>
          <div className="mt-10">
            <p className="text-sm text-white/60">Your Recommended Package</p>
            <h2 className="mt-2 text-4xl font-semibold tracking-normal">Signature</h2>
            <p className="mt-3 max-w-sm text-white/70">For listings that need visual depth, a stronger launch, and media that feels less formulaic.</p>
          </div>
          <div className="mt-9 grid gap-3">
            {["Professional photos", "Drone photos", "Video", "Property website"].map((item) => (
              <div key={item} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3">
                <span className="text-sm text-white/78">{item}</span>
                <Check className="h-4 w-4 text-[#d6dbdc]" />
              </div>
            ))}
          </div>
          <div className="mt-8 rounded-2xl bg-white p-5 text-[#111011]">
            <p className="text-sm font-medium">Starting package price</p>
            <p className="mt-1 text-3xl font-semibold">$714</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProgressBar({ current, total, answered }: { current: number; total: number; answered: number }) {
  const progress = Math.round((current / total) * 100);

  return (
    <div className="mb-8">
      <div className="mb-3 flex items-center justify-between text-sm text-[#828487]">
        <span>
          Step {current} of {total}
        </span>
        <span>{answered} answered</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/80">
        <div className="h-full rounded-full bg-[#111011] transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}

function QuestionShell({
  children,
  onBack,
  canContinue,
  onContinue,
  answers,
}: {
  children: ReactNode;
  onBack: () => void;
  canContinue?: boolean;
  onContinue: () => void;
  answers: Answers;
}) {
  const selectedNeeds = getMultiAnswer(answers, "knownNeeds");

  return (
    <div className="rounded-[2rem] border border-white bg-white p-4 shadow-soft-xl sm:p-6">
      <div className="rounded-[1.5rem] border border-black/10 bg-[#fafafa] p-5 sm:p-8">
        {children}
        <div className="mt-8 flex items-center justify-between gap-3">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          {canContinue && (
            <Button onClick={onContinue} disabled={selectedNeeds.length === 0}>
              See recommendation
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function QuestionStep({ question, value, onSelect }: { question: QuestionConfig; value?: string; onSelect: (value: string) => void }) {
  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#828487]">{question.eyebrow}</p>
      <h2 className="mt-3 max-w-3xl text-3xl font-semibold leading-tight tracking-normal text-[#111011] sm:text-5xl">{question.question}</h2>
      <div className="mt-8 grid gap-3">
        {question.options.map((option, index) => (
          <OptionCard key={option.id} option={option} selected={value === option.id} onClick={() => onSelect(option.id)} index={index} />
        ))}
      </div>
    </div>
  );
}

function MultiSelectStep({
  question,
  answers,
  onChange,
}: {
  question: QuestionConfig;
  answers: Answers;
  onChange: (questionId: QuestionId, value: string[]) => void;
}) {
  const selected = getMultiAnswer(answers, question.id);

  const toggle = (optionId: string) => {
    if (optionId === "recommend") {
      onChange(question.id, selected.includes(optionId) ? [] : [optionId]);
      return;
    }

    const withoutRecommend = selected.filter((item) => item !== "recommend");
    onChange(question.id, withoutRecommend.includes(optionId) ? withoutRecommend.filter((item) => item !== optionId) : [...withoutRecommend, optionId]);
  };

  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#828487]">{question.eyebrow}</p>
      <h2 className="mt-3 max-w-3xl text-3xl font-semibold leading-tight tracking-normal text-[#111011] sm:text-5xl">{question.question}</h2>
      <p className="mt-4 text-base text-[#606266]">Choose all that apply.</p>
      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {question.options.map((option, index) => (
          <OptionCard key={option.id} option={option} selected={selected.includes(option.id)} onClick={() => toggle(option.id)} index={index} compact />
        ))}
      </div>
    </div>
  );
}

function OptionCard({
  option,
  selected,
  onClick,
  index,
  compact,
}: {
  option: Option;
  selected?: boolean;
  onClick: () => void;
  index: number;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      className={cx(
        "group flex w-full animate-fade-up items-center justify-between gap-4 rounded-3xl border p-5 text-left transition duration-300",
        selected
          ? "border-[#111011] bg-[#111011] text-white shadow-[0_18px_44px_rgba(0,0,0,0.18)]"
          : "border-black/10 bg-white hover:-translate-y-0.5 hover:border-black/25 hover:shadow-[0_16px_50px_rgba(0,0,0,0.08)]",
        compact ? "min-h-[96px]" : "min-h-[112px]",
      )}
      style={{ animationDelay: `${index * 35}ms` }}
      onClick={onClick}
    >
      <span>
        <span className={cx("block text-lg font-semibold tracking-normal", selected ? "text-white" : "text-[#111011]")}>{option.label}</span>
        {option.hint && <span className={cx("mt-2 block text-sm leading-6", selected ? "text-white/68" : "text-[#606266]")}>{option.hint}</span>}
      </span>
      <span
        className={cx(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition",
          selected ? "border-white/25 bg-white text-[#111011]" : "border-black/10 bg-[#f1f1f1] text-[#828487] group-hover:bg-[#111011] group-hover:text-white",
        )}
      >
        {selected ? <Check className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
      </span>
    </button>
  );
}

function RecommendationScreen({
  answers,
  recommendation,
  onStartOver,
  onEdit,
}: {
  answers: Answers;
  recommendation: Recommendation;
  onStartOver: () => void;
  onEdit: (questionId: QuestionId) => void;
}) {
  const Icon = iconMap[PACKAGE_ICONS[recommendation.package.id]];

  return (
    <div className="mx-auto grid max-w-7xl gap-6 animate-fade-up lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="rounded-[2rem] border border-white bg-white p-4 shadow-soft-xl sm:p-6">
        <div className="rounded-[1.5rem] bg-[#111011] p-6 text-white sm:p-8 lg:p-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#d6dbdc]">Your Recommended Package</p>
              <h2 className="mt-4 text-5xl font-semibold leading-none tracking-normal sm:text-6xl">{recommendation.package.name}</h2>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-white/72">{recommendation.reason}</p>
            </div>
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white text-[#111011]">
              <Icon className="h-7 w-7" />
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <InfoTile label="Best for" value={recommendation.package.bestFor} />
            <InfoTile label="Package price" value={formatPrice(recommendation.estimatedPrice, recommendation.isStartingPrice)} featured />
            <InfoTile label={recommendation.photoCount ? "Photo coverage" : "Property size"} value={recommendation.photoCount || recommendation.sizeLabel} />
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.85fr]">
            <IncludedServices services={recommendation.package.includes} />
            <RecommendedAddOns addOns={recommendation.addOns} />
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" variant="gold" onClick={() => console.log("Book package", recommendation.package.name)}>
              <CircleDollarSign className="h-4 w-4" />
              Book this package
            </Button>
            <Button size="lg" variant="outlineDark" onClick={() => console.log("Customize package", recommendation.package.name)}>
              Customize this package
            </Button>
            <Button size="lg" variant="ghostDark" onClick={onStartOver}>
              Start over
            </Button>
          </div>
        </div>
      </div>

      <aside className="space-y-4">
        <SummaryPanel answers={answers} onEdit={onEdit} />
        <ChooseForMeCard />
        <PackageComparison />
        <p className="px-1 text-xs leading-5 text-[#828487]">
          Package pricing reflects the selected square-foot tier. Add-ons and custom production needs change the final total.
        </p>
      </aside>
    </div>
  );
}

function InfoTile({ label, value, featured }: { label: string; value: string; featured?: boolean }) {
  return (
    <div className={cx("rounded-3xl border p-5", featured ? "border-white bg-white text-[#111011]" : "border-white/10 bg-white/[0.06]")}>
      <p className={cx("text-xs font-semibold uppercase tracking-[0.16em]", featured ? "text-[#606266]" : "text-white/45")}>{label}</p>
      <p className="mt-3 text-lg font-semibold capitalize leading-7 tracking-normal">{value}</p>
    </div>
  );
}

function IncludedServices({ services }: { services: string[] }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-5">
      <h3 className="text-xl font-semibold tracking-normal">What's included</h3>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {services.map((item) => (
          <div key={item} className="flex items-start gap-3 text-sm leading-6 text-white/74">
            <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-[#111011]">
              <Check className="h-3 w-3" />
            </span>
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

function RecommendedAddOns({ addOns }: { addOns: AddOnConfig[] }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-5">
      <h3 className="text-xl font-semibold tracking-normal">Recommended add-ons</h3>
      <div className="mt-5 space-y-3">
        {addOns.length > 0 ? (
          addOns.map((addOn) => (
            <div key={addOn.name} className="rounded-2xl bg-white/[0.07] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{addOn.name}</p>
                  <p className="mt-1 text-sm leading-6 text-white/60">{addOn.purpose}</p>
                </div>
                <span className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#111011]">
                  ${addOn.price.toLocaleString()}{addOn.priceSuffix || ""}
                </span>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm leading-6 text-white/64">No must-have add-ons based on your answers. This package should cover the core need.</p>
        )}
      </div>
    </div>
  );
}

function SummaryPanel({ answers, onEdit }: { answers: Answers; onEdit: (questionId: QuestionId) => void }) {
  return (
    <div className="rounded-[1.5rem] border border-black/10 bg-white p-5 shadow-[0_18px_60px_rgba(0,0,0,0.06)]">
      <h3 className="text-lg font-semibold tracking-normal text-[#111011]">You told us</h3>
      <div className="mt-4 space-y-3">
        {QUESTION_CONFIG.map((question) => {
          const value = answers[question.id];
          const label = Array.isArray(value) ? value.map((item) => answerLabel(question.id, item)).join(", ") : value ? answerLabel(question.id, value) : "Not answered";

          return (
            <button
              type="button"
              key={question.id}
              className="w-full rounded-2xl border border-black/10 bg-[#f7f7f7] p-4 text-left transition hover:border-black/25 hover:bg-white"
              onClick={() => onEdit(question.id)}
            >
              <span className="block text-xs font-semibold uppercase tracking-[0.14em] text-[#828487]">{question.eyebrow}</span>
              <span className="mt-1 block text-sm leading-6 text-[#111011]">{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ChooseForMeCard() {
  return (
    <div className="rounded-[1.5rem] border border-black/10 bg-white p-5 shadow-[0_18px_60px_rgba(0,0,0,0.06)]">
      <p className="text-base font-semibold text-[#111011]">Want us to choose for you?</p>
      <p className="mt-2 text-sm leading-6 text-[#606266]">Send us the listing and we'll recommend the right package.</p>
      <Button className="mt-4 w-full" onClick={() => console.log("Send listing CTA")}>
        Send listing
      </Button>
    </div>
  );
}

function PackageComparison() {
  const corePackages = Object.values(PACKAGE_CONFIG.packages).filter((item) => item.category === "core");

  return (
    <details className="group rounded-[1.5rem] border border-black/10 bg-white p-5 shadow-[0_18px_60px_rgba(0,0,0,0.06)]">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-base font-semibold text-[#111011]">
        Compare packages
        <ChevronDown className="h-4 w-4 transition group-open:rotate-180" />
      </summary>
      <div className="mt-4 space-y-3">
        {corePackages.map((item) => (
          <div key={item.id} className="rounded-2xl border border-black/10 bg-[#f7f7f7] p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-[#111011]">{item.name}</p>
                <p className="mt-1 text-sm leading-6 text-[#606266]">{item.purpose}</p>
              </div>
              <span className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#111011]">
                {formatPrice(getPackagePricing(item).price, true)}
              </span>
            </div>
            <p className="mt-3 text-xs leading-5 text-[#828487]">{item.includes.slice(0, 4).join(" / ")}</p>
          </div>
        ))}
      </div>
    </details>
  );
}

function Button({
  children,
  className,
  variant = "default",
  size = "default",
  ...props
}: {
  children: ReactNode;
  className?: string;
  variant?: "default" | "ghost" | "gold" | "outlineDark" | "ghostDark";
  size?: "default" | "lg";
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cx(
        "inline-flex items-center justify-center gap-2 rounded-full text-base font-medium transition disabled:pointer-events-none disabled:opacity-40",
        size === "lg" ? "h-14 px-7" : "h-12 px-5",
        variant === "default" && "bg-[#111011] text-white hover:bg-black",
        variant === "ghost" && "bg-transparent text-[#606266] hover:bg-[#f1f1f1]",
        variant === "gold" && "bg-white text-[#111011] hover:bg-[#d6dbdc]",
        variant === "outlineDark" && "border border-white/20 bg-white/10 text-white hover:bg-white hover:text-[#111011]",
        variant === "ghostDark" && "bg-transparent text-white/75 hover:bg-white/10",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
