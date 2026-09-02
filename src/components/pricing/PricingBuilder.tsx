import { ReactNode, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  CircleDollarSign,
  ExternalLink,
  Film,
  Home,
  Image,
  Layers3,
  LoaderCircle,
  Map,
  RotateCcw,
  Send,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import {
  ADD_ONS,
  ARYEO_CATALOG_REVIEWED_AT,
  PACKAGE_CONFIG,
  getDefaultCatalogVariant,
  type AddOnConfig,
  type PackageConfig,
  type PackageId,
} from "../../../shared/aryeoCatalog";
import {
  requestBookingSession,
  type BookingSessionRequest,
  type BookingSessionResult,
} from "../../lib/aryeoBooking";

export { PACKAGE_CONFIG };

type QuestionId = "propertyType" | "goal" | "socialImportance" | "size" | "knownNeeds";
type SizeTier =
  | "under_1000"
  | "1001_2000"
  | "2001_3000"
  | "3001_4000"
  | "4000_6000"
  | "6001_8000"
  | "over_8000"
  | "not_sure";

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
  landPackage: "map",
  lot: "map",
  locationPackage: "map",
  preListing: "layers",
  exteriorPhotos: "image",
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

export function getPackagePricing(packageConfig: PackageConfig, _size: SizeTier = "not_sure") {
  const selectedVariant = packageConfig.variants[0];
  if (!selectedVariant) throw new Error(`Missing Aryeo variant for ${packageConfig.name}`);
  return { price: selectedVariant.price, photos: packageConfig.photoCount, isStarting: false };
}

const packageIncludesDrone = (packageId: PackageId) => [
  "signature",
  "premier",
  "contentPro",
  "influencer",
  "landPackage",
  "lot",
  "locationPackage",
  "preListing",
].includes(packageId);

const packageIncludesVideo = (packageId: PackageId) => [
  "essentials",
  "signature",
  "premier",
  "casualScroller",
  "contentPro",
  "influencer",
  "landPackage",
  "preListing",
].includes(packageId);

const packageIncludesTwilight = (packageId: PackageId) => ["essentials", "signature", "premier", "preListing"].includes(packageId);

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
    if (socialImportance === "major") {
      packageId = "influencer";
      reason = "This live social package gives a premium rental strong listing coverage plus agent-led lifestyle content.";
    } else if (goal === "personal_brand" || socialImportance === "very") {
      packageId = "contentPro";
      reason = "This live social package combines polished listing coverage with higher-production short-form content.";
    } else if (goal === "premium" || goal === "custom" || goal === "sell_fast") {
      packageId = "signature";
      reason = "Signature is the closest live Aryeo offering for a rental that needs photo, video, aerial, and 3D depth.";
    } else if (goal === "polished" || socialImportance === "somewhat") {
      packageId = "essentials";
      reason = "Essentials keeps the rental presentation polished while letting you choose the most useful video, reel, or 3D enhancement.";
    } else {
      packageId = "starter";
      reason = "No rental-only package is on the live form, so Starter is the closest current option for focused photo coverage.";
    }
  } else if (propertyType === "pre_listing") {
    packageId = goal === "essentials_only" ? "exteriorPhotos" : "preListing";
    reason = goal === "essentials_only"
      ? "Exterior Photos is the focused live option for a simple coming-soon preview."
      : "The Pre Listing Package gives you broad exterior, aerial, neighborhood, video, and twilight coverage before the full launch.";
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
  const availablePackages = Object.values(PACKAGE_CONFIG.packages);

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
        <div className="mt-9 flex">
          <Button size="lg" onClick={onStart}>
            Build my package
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="rounded-[2rem] border border-white bg-white p-4 shadow-soft-xl">
        <div className="overflow-hidden rounded-[1.5rem] border border-black/10 bg-[#111011] p-6 text-white">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-white/55">Available packages</p>
              <p className="mt-2 text-2xl font-semibold tracking-normal">A fit for every listing</p>
            </div>
            <img src={NO_WALLS_FAVICON_URL} alt="" className="h-8 w-8 rounded-lg bg-white" />
          </div>

          <div className="mt-6 h-[430px] overflow-hidden sm:h-[470px]">
            <div className="package-scroll-track flex flex-col gap-3">
              {[0, 1].map((setIndex) => (
                <div key={setIndex} className="grid gap-3" aria-hidden={setIndex === 1}>
                  {availablePackages.map((packageItem) => {
                    const pricing = getPackagePricing(packageItem);
                    return (
                      <div
                        key={`${setIndex}-${packageItem.id}`}
                        className="flex h-[88px] items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.06] px-4"
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/45">{packageItem.category.replace("-", " ")}</p>
                          <p className="mt-1 text-lg font-semibold leading-6 tracking-normal text-white">{packageItem.name}</p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-xs text-white/45">{pricing.isStarting ? "Starting at" : "Package"}</p>
                          <p className="mt-1 text-lg font-semibold">${pricing.price.toLocaleString()}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
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
  const [bookingOpen, setBookingOpen] = useState(false);

  const openBookingForm = () => {
    setBookingOpen(true);
    window.setTimeout(() => document.getElementById("booking-request")?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
  };

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
            <Button size="lg" variant="gold" onClick={openBookingForm} aria-expanded={bookingOpen} aria-controls="booking-request">
              <CircleDollarSign className="h-4 w-4" />
              Book this package
            </Button>
            <Button size="lg" variant="ghostDark" onClick={onStartOver}>
              Start over
            </Button>
          </div>

          {bookingOpen && <BookingRequestForm recommendation={recommendation} />}
        </div>
      </div>

      <aside className="space-y-4">
        <SummaryPanel answers={answers} onEdit={onEdit} />
        <ChooseForMeCard onChoose={openBookingForm} />
        <PackageComparison />
        <p className="px-1 text-xs leading-5 text-[#828487]">
          Prices match the production NW Order Now catalog reviewed {ARYEO_CATALOG_REVIEWED_AT}. Aryeo confirms availability, selected options, and the final total.
        </p>
      </aside>
    </div>
  );
}

function BookingRequestForm({ recommendation }: { recommendation: Recommendation }) {
  const packagePrice = formatPrice(recommendation.estimatedPrice, recommendation.isStartingPrice);
  const defaultVariant = getDefaultCatalogVariant(recommendation.package.id);
  const [selectedVariantKey, setSelectedVariantKey] = useState(defaultVariant.key);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<BookingSessionResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const selectedVariant = recommendation.package.variants.find((variant) => variant.key === selectedVariantKey) || defaultVariant;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const request: BookingSessionRequest = {
      customer: {
        firstName: String(formData.get("firstName") ?? "").trim(),
        lastName: String(formData.get("lastName") ?? "").trim(),
        email: String(formData.get("email") ?? "").trim(),
        phone: String(formData.get("phone") ?? "").trim(),
      },
      address: {
        streetNumber: String(formData.get("streetNumber") ?? "").trim(),
        streetName: String(formData.get("streetName") ?? "").trim(),
        unitNumber: String(formData.get("unitNumber") ?? "").trim() || undefined,
        city: String(formData.get("city") ?? "").trim(),
        stateOrProvince: String(formData.get("stateOrProvince") ?? "").trim(),
        postalCode: String(formData.get("postalCode") ?? "").trim(),
        country: "US",
      },
      selection: {
        packageId: recommendation.package.id,
        variantKey: selectedVariantKey,
      },
      companyWebsite: String(formData.get("companyWebsite") ?? "").trim() || undefined,
    };

    setSubmitting(true);
    setErrorMessage(null);
    try {
      setResult(await requestBookingSession(request));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Please review the booking details and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const fieldClass =
    "mt-2 h-12 w-full rounded-xl border border-white/15 bg-white/[0.07] px-4 text-base text-white outline-none transition placeholder:text-white/35 focus:border-white/55 focus:bg-white/[0.1]";

  if (result) {
    return (
      <div id="booking-request" className="mt-8 border-t border-white/12 pt-8" role="status">
        <div className="flex items-start gap-4 rounded-2xl border border-white/15 bg-white/[0.08] p-5 sm:p-6">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-[#111011]">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-white/45">Ready for Aryeo</p>
            <h3 className="mt-2 text-2xl font-semibold tracking-normal">Finish the live booking</h3>
            <p className="mt-3 text-sm leading-6 text-white/68">
              {result.carriesCustomerDetails && result.carriesAddressDetails
                ? "Your contact and property details are prefilled. Aryeo will ask you to review them, choose the service below, schedule, accept the terms, and confirm."
                : result.carriesCustomerDetails
                  ? result.notice || "Your contact details are prefilled. Confirm the property address in Aryeo, then choose the service below, schedule, accept the terms, and confirm."
                : result.notice || "Continue in Aryeo to enter the property details, schedule, accept the terms, and confirm."}
            </p>
            <div className="mt-5 rounded-xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/40">Choose in Aryeo</p>
              <p className="mt-2 font-semibold">{recommendation.package.name} — {selectedVariant.label}</p>
              <p className="mt-1 text-sm text-white/55">{formatPrice(selectedVariant.price)} before any additional selections</p>
            </div>
            <a
              className="mt-5 inline-flex h-14 items-center justify-center gap-2 rounded-full bg-white px-7 text-base font-medium text-[#111011] transition hover:bg-[#d6dbdc]"
              href={result.bookingUrl}
            >
              Continue in Aryeo
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form id="booking-request" className="mt-8 border-t border-white/12 pt-8" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/45">Live booking handoff</p>
          <h3 className="mt-2 text-2xl font-semibold tracking-normal">Prefill your Aryeo booking</h3>
        </div>
        <div className="border-l border-white/15 pl-4 sm:text-right">
          <p className="text-sm text-white/50">{recommendation.package.name}</p>
          <p className="mt-1 text-xl font-semibold">{packagePrice}</p>
        </div>
      </div>

      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        <label className="text-sm font-medium text-white/78">
          First name
          <input className={fieldClass} name="firstName" autoComplete="given-name" maxLength={100} required />
        </label>
        <label className="text-sm font-medium text-white/78">
          Last name
          <input className={fieldClass} name="lastName" autoComplete="family-name" maxLength={100} required />
        </label>
        <label className="text-sm font-medium text-white/78">
          Email
          <input className={fieldClass} name="email" type="email" autoComplete="email" inputMode="email" maxLength={254} required />
        </label>
        <label className="text-sm font-medium text-white/78">
          Phone
          <input className={fieldClass} name="phone" type="tel" autoComplete="tel" inputMode="tel" maxLength={30} required />
        </label>
      </div>

      <fieldset className="mt-7">
        <legend className="text-sm font-semibold uppercase tracking-[0.14em] text-white/45">Property address</legend>
        <div className="mt-1 grid gap-5 sm:grid-cols-[0.38fr_1fr]">
          <label className="text-sm font-medium text-white/78">
            Street number
            <input className={fieldClass} name="streetNumber" autoComplete="off" maxLength={30} required />
          </label>
          <label className="text-sm font-medium text-white/78">
            Street name
            <input className={fieldClass} name="streetName" maxLength={150} placeholder="Main Street" required />
          </label>
        </div>
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <label className="text-sm font-medium text-white/78">
            Unit <span className="font-normal text-white/40">(optional)</span>
            <input className={fieldClass} name="unitNumber" autoComplete="address-line2" maxLength={50} />
          </label>
          <label className="text-sm font-medium text-white/78">
            City
            <input className={fieldClass} name="city" autoComplete="address-level2" maxLength={100} required />
          </label>
          <label className="text-sm font-medium text-white/78">
            State
            <input className={fieldClass} name="stateOrProvince" autoComplete="address-level1" maxLength={100} placeholder="CO" required />
          </label>
          <label className="text-sm font-medium text-white/78">
            ZIP code
            <input className={fieldClass} name="postalCode" autoComplete="postal-code" inputMode="numeric" maxLength={20} required />
          </label>
        </div>
      </fieldset>

      {recommendation.package.variants.length > 1 && (
        <label className="mt-7 block text-sm font-medium text-white/78">
          Package option
          <select
            className={fieldClass}
            name="variantKey"
            value={selectedVariantKey}
            onChange={(event) => setSelectedVariantKey(event.target.value)}
            required
          >
            {recommendation.package.variants.map((variant) => (
              <option className="bg-[#111011] text-white" key={variant.key} value={variant.key}>
                {variant.label} — {formatPrice(variant.price)}
              </option>
            ))}
          </select>
          {recommendation.package.selectionHint && <span className="mt-2 block text-xs leading-5 text-white/45">{recommendation.package.selectionHint}</span>}
        </label>
      )}

      <div className="absolute left-[-10000px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
        <label>
          Company website
          <input name="companyWebsite" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <p className="mt-6 max-w-3xl text-sm leading-6 text-white/55">
        Aryeo remains the system of record. On the next screen you will review the property, choose the matching service and any add-ons, schedule, accept the terms, and confirm the order.
      </p>

      {errorMessage && (
        <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-300/30 bg-red-400/10 p-4 text-sm leading-6 text-red-100" role="alert">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {errorMessage}
        </div>
      )}

      <Button className="mt-6 w-full sm:w-auto" type="submit" size="lg" variant="gold" disabled={submitting}>
        {submitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        {submitting ? "Preparing Aryeo…" : "Prepare live booking"}
      </Button>
    </form>
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
      <h3 className="text-xl font-semibold tracking-normal">Recommended options</h3>
      <div className="mt-5 space-y-3">
        {addOns.length > 0 ? (
          addOns.map((addOn) => (
            <div key={addOn.name} className="rounded-2xl bg-white/[0.07] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{addOn.name}</p>
                  <p className="mt-1 text-sm leading-6 text-white/60">{addOn.purpose}</p>
                  <p className="mt-2 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-white/35">
                    {addOn.aryeoType === "MAIN" ? "Separate service in Aryeo" : "Aryeo add-on"}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#111011]">
                  ${addOn.price.toLocaleString()}{addOn.priceSuffix || ""}
                </span>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm leading-6 text-white/64">No must-have extras based on your answers. This package should cover the core need.</p>
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

function ChooseForMeCard({ onChoose }: { onChoose: () => void }) {
  return (
    <div className="rounded-[1.5rem] border border-black/10 bg-white p-5 shadow-[0_18px_60px_rgba(0,0,0,0.06)]">
      <p className="text-base font-semibold text-[#111011]">Want us to choose for you?</p>
      <p className="mt-2 text-sm leading-6 text-[#606266]">Start with this recommendation and confirm the final service details in Aryeo.</p>
      <Button className="mt-4 w-full" onClick={onChoose}>
        Start booking details
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
  variant?: "default" | "ghost" | "gold" | "ghostDark";
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
        variant === "ghostDark" && "bg-transparent text-white/75 hover:bg-white/10",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
