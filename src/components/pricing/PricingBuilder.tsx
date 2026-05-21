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
type PackageId =
  | "starter"
  | "essentials"
  | "signature"
  | "premier"
  | "socialBoostLite"
  | "socialBoostPro"
  | "landLot"
  | "exteriorPreview"
  | "locationPreview"
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
  startingPrice: number;
  category: "core" | "social" | "land" | "pre-listing";
  includes: string[];
};

type Answers = Partial<Record<QuestionId, string | string[]>>;

type Recommendation = {
  package: PackageConfig;
  reason: string;
  addOns: PackageConfig[];
  sizeModifier: number | "custom_quote";
  isCustomQuote: boolean;
  estimatedPrice: number | "custom_quote";
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

export const PACKAGE_CONFIG = {
  squareFootageModifiers: {
    under_1000: 0,
    "1000_2000": 50,
    "2000_3500": 100,
    "3500_5000": 200,
    over_5000: "custom_quote",
    not_sure: 0,
  },
  packages: {
    starter: {
      id: "starter",
      name: "Starter",
      purpose: "Simple listing, lower budget, essential photos.",
      bestFor: "Simple listings that need clean MLS-ready media",
      startingPrice: 195,
      category: "core",
      includes: ["Professional listing photos", "Basic delivery", "MLS-ready gallery"],
    },
    essentials: {
      id: "essentials",
      name: "Essentials",
      purpose: "Polished standard listing.",
      bestFor: "Standard listings that need a professional presentation",
      startingPrice: 395,
      category: "core",
      includes: [
        "Professional photos",
        "Drone photos",
        "Floor plan",
        "Property website or listing page",
        "Basic marketing assets",
      ],
    },
    signature: {
      id: "signature",
      name: "Signature",
      purpose: "Strong listing presentation with more visual depth.",
      bestFor: "Listings where speed, clarity, and visual depth matter",
      startingPrice: 695,
      category: "core",
      includes: [
        "Professional photos",
        "Drone photos",
        "Video",
        "Floor plan",
        "Property website",
        "Social-friendly assets",
        "Virtual twilight",
      ],
    },
    premier: {
      id: "premier",
      name: "Premier",
      purpose: "Premium or higher-value listings.",
      bestFor: "Luxury, high-value, or story-driven properties",
      startingPrice: 995,
      category: "core",
      includes: [
        "Full photo package",
        "Drone photos and video",
        "Cinematic listing video",
        "Floor plan",
        "Property website",
        "Twilight or virtual twilight",
        "Social content kit",
        "Neighborhood or lifestyle content",
      ],
    },
    socialBoostLite: {
      id: "socialBoostLite",
      name: "Social Boost Lite",
      purpose: "A few strong assets for agents who want usable social content.",
      bestFor: "Agents who want simple social-ready listing content",
      startingPrice: 395,
      category: "social",
      includes: ["1 reel", "Short-form clips", "Social-ready exports"],
    },
    socialBoostPro: {
      id: "socialBoostPro",
      name: "Social Boost Pro",
      purpose: "For agents who want the listing to build their personal brand too.",
      bestFor: "Agents treating social as part of the listing strategy",
      startingPrice: 695,
      category: "social",
      includes: ["Multiple reels", "Vertical video edits", "Social captions or content prompts", "Agent-facing content kit"],
    },
    landLot: {
      id: "landLot",
      name: "Land / Lot Package",
      purpose: "Clear visual context for land, lots, and acreage.",
      bestFor: "Land, lots, acreage, and location-driven listings",
      startingPrice: 495,
      category: "land",
      includes: ["Land photography", "Drone photos", "Boundary graphics", "Neighborhood / access imagery", "Optional video"],
    },
    exteriorPreview: {
      id: "exteriorPreview",
      name: "Exterior Preview",
      purpose: "Quick pre-market exterior-only content.",
      bestFor: "Early listing prep before the property is ready",
      startingPrice: 89,
      category: "pre-listing",
      includes: ["Exterior photos only"],
    },
    locationPreview: {
      id: "locationPreview",
      name: "Location Preview",
      purpose: "A light coming-soon preview with location context.",
      bestFor: "Teasing location and exterior appeal before launch",
      startingPrice: 149,
      category: "pre-listing",
      includes: ["Exterior photos", "Neighborhood / location images"],
    },
    preListing: {
      id: "preListing",
      name: "Pre-Listing Package",
      purpose: "Coming soon content with a stronger launch signal.",
      bestFor: "Pre-listing campaigns and coming-soon announcements",
      startingPrice: 349,
      category: "pre-listing",
      includes: ["Exterior photos", "Drone photos", "Coming soon content", "Social teaser assets"],
    },
  } satisfies Record<PackageId, PackageConfig>,
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
      { id: "under_1000", label: "Under 1,000 sq ft", hint: "Compact property." },
      { id: "1000_2000", label: "1,000 to 2,000 sq ft", hint: "Small to mid-size property." },
      { id: "2000_3500", label: "2,000 to 3,500 sq ft", hint: "Mid-size listing." },
      { id: "3500_5000", label: "3,500 to 5,000 sq ft", hint: "Larger property with more coverage needs." },
      { id: "over_5000", label: "Over 5,000 sq ft", hint: "Custom quote recommended." },
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
  socialBoostLite: "film",
  socialBoostPro: "sparkles",
  landLot: "map",
  exteriorPreview: "image",
  locationPreview: "map",
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

const formatPrice = (price: number | "custom_quote") => (price === "custom_quote" ? "Custom quote recommended" : `Starting at $${price.toLocaleString()}`);

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
    packageId = "landLot";
    reason = "Land listings benefit from drone context, boundary graphics, and access imagery more than a standard interior-first package.";
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
    reason = "This balances professional photos, drone, floor plan, and a simple web presence for a clean launch.";
  } else if (goal === "sell_fast") {
    packageId = "signature";
    reason = "A faster sale usually needs more visual depth, especially video, website, and social-friendly assets.";
  } else if (goal === "premium" || goal === "custom") {
    packageId = "premier";
    reason = "This gives the listing a fuller, more elevated media story with room for custom production needs.";
  } else if (goal === "personal_brand") {
    packageId = socialImportance === "major" ? "premier" : "signature";
    reason = "You are marketing both the property and your brand, so the recommendation includes stronger video and social-ready output.";
  }

  const highIntentNeeds = ["video", "drone", "website", "social_reels"].filter((need) => needsSet.has(need));
  if (propertyType !== "land" && propertyType !== "pre_listing") {
    if (highIntentNeeds.length >= 4 || socialImportance === "major") {
      packageId = "premier";
      reason = "Your answers point to a more complete launch with video, drone, web, and social content working together.";
    } else if (highIntentNeeds.length >= 3 && packageId !== "premier") {
      packageId = "signature";
      reason = "You selected several higher-impact deliverables, so Signature is the better fit than a basic package.";
    }
  }

  const addOns: PackageConfig[] = [];
  if (socialImportance === "very" || socialImportance === "major" || goal === "personal_brand" || needsSet.has("social_reels")) {
    addOns.push(getPackage("socialBoostPro"));
  } else if (socialImportance === "somewhat") {
    addOns.push(getPackage("socialBoostLite"));
  }

  if (needsSet.has("twilight") && packageId !== "signature" && packageId !== "premier") {
    addOns.push({
      id: "signature",
      name: "Twilight / Virtual Twilight Upgrade",
      purpose: "Add a more emotional hero image to the listing launch.",
      bestFor: "Listings that need a stronger first impression",
      startingPrice: 150,
      category: "core",
      includes: ["Twilight or virtual twilight images"],
    });
  }

  if (needsSet.has("neighborhood") && packageId !== "premier" && packageId !== "landLot") {
    addOns.push({
      id: "premier",
      name: "Neighborhood Story Add-On",
      purpose: "Add nearby lifestyle and location context.",
      bestFor: "Listings where the area is part of the value",
      startingPrice: 250,
      category: "core",
      includes: ["Neighborhood imagery", "Lifestyle details", "Location context"],
    });
  }

  const recommendedPackage = getPackage(packageId);
  const rawSizeModifier = PACKAGE_CONFIG.squareFootageModifiers[(size ?? "not_sure") as keyof typeof PACKAGE_CONFIG.squareFootageModifiers];
  const sizeModifier: number | "custom_quote" = rawSizeModifier === "custom_quote" ? "custom_quote" : Number(rawSizeModifier);
  const isCustomQuote = sizeModifier === "custom_quote";
  const estimatedPrice = isCustomQuote ? "custom_quote" : recommendedPackage.startingPrice + sizeModifier;

  return {
    package: recommendedPackage,
    reason,
    addOns: dedupePackages(addOns, packageId),
    sizeModifier,
    isCustomQuote,
    estimatedPrice,
  };
}

function dedupePackages(packages: PackageConfig[], recommendedId: PackageId) {
  const seen = new Set<PackageId>([recommendedId]);
  return packages.filter((item) => {
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
        <p className="hidden text-sm font-semibold uppercase tracking-[0.16em] text-[#828487] sm:block">Pricing Builder Demo</p>
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
            <p className="text-sm font-medium">Estimated starting price</p>
            <p className="mt-1 text-3xl font-semibold">$695+</p>
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
            <InfoTile label="Estimated price" value={formatPrice(recommendation.estimatedPrice)} featured />
            <InfoTile label="Package type" value={recommendation.package.category.replace("-", " ")} />
          </div>

          {recommendation.isCustomQuote && (
            <div className="mt-5 rounded-3xl border border-white/20 bg-white/[0.07] p-5 text-[#d6dbdc]">
              Custom quote recommended for properties over 5,000 sq ft.
            </div>
          )}

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
          Pricing shown is an estimate. Final pricing may vary based on property size, location, scheduling, and custom production needs.
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

function RecommendedAddOns({ addOns }: { addOns: PackageConfig[] }) {
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
                <span className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#111011]">${addOn.startingPrice}+</span>
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
              <span className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#111011]">${item.startingPrice}+</span>
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
