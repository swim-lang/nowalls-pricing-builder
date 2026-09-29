import { useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  Camera,
  Check,
  MapPin,
  MonitorPlay,
  Smartphone,
  Sparkles,
  Video,
  Youtube,
} from "lucide-react";

import {
  ADD_ONS,
  PACKAGE_CONFIG,
  PHOTO_ONLY_OPTIONS,
  SIZE_TIER_CONFIG,
  getPackagePricingForSize,
  type PackageId,
  type PricedSizeTier,
} from "../../../shared/aryeoCatalog";

const CORE_PACKAGE_IDS: PackageId[] = ["starter", "essentials", "signature", "premier"];
const PRE_LISTING_PACKAGE_IDS: PackageId[] = ["exteriorPhotos", "lot", "locationPackage"];

const VIDEO_LEVELS = [
  {
    name: ADD_ONS.classicVideo.name,
    label: "Clean + clear",
    description: ADD_ONS.classicVideo.purpose,
    price: ADD_ONS.classicVideo.price,
    supportsOrientation: true,
  },
  {
    name: ADD_ONS.cinematicVideo.name,
    label: "Cinematic + elevated",
    description: ADD_ONS.cinematicVideo.purpose,
    price: ADD_ONS.cinematicVideo.price,
    supportsOrientation: true,
  },
  {
    name: ADD_ONS.influencerVideo.name,
    label: "Agent-led + social",
    description: ADD_ONS.influencerVideo.purpose,
    price: ADD_ONS.influencerVideo.price,
    supportsOrientation: true,
  },
  {
    name: ADD_ONS.lifestyleVideo.name,
    label: "Story + place",
    description: ADD_ONS.lifestyleVideo.purpose,
    price: ADD_ONS.lifestyleVideo.price,
    supportsOrientation: false,
  },
];

const formatPrice = (price: number) => `$${price.toLocaleString()}`;

export default function PricingOverview({ onBuild }: { onBuild: () => void }) {
  const [selectedSize, setSelectedSize] = useState<PricedSizeTier>("1001_2000");
  const [orientation, setOrientation] = useState<"horizontal" | "vertical">("horizontal");

  const influencer = PACKAGE_CONFIG.packages.influencer;
  const creator = PACKAGE_CONFIG.packages.contentCreator;
  const influencerPricing = getPackagePricingForSize(influencer, selectedSize);

  return (
    <div id="pricing-preview" className="mt-24 space-y-8 sm:mt-32">
      <section className="rounded-[2rem] border border-white bg-white p-4 shadow-soft-xl sm:p-6">
        <div className="rounded-[1.5rem] border border-black/10 bg-[#fafafa] p-5 sm:p-8 lg:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#828487]">September pricing concept</p>
              <h2 className="mt-3 text-4xl font-semibold leading-tight tracking-normal sm:text-5xl">
                Start with the property. Scale the coverage with it.
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-[#606266] sm:text-lg">
                Every primary package now prices cleanly by square footage, so agents can compare the outcome without decoding a long service menu.
              </p>
            </div>
            <div className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-[#606266]">
              <span className="font-semibold text-[#111011]">Review mode:</span> nothing here changes the live order form.
            </div>
          </div>

          <div className="mt-8">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#828487]">Choose a property size</p>
            <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Property size for pricing preview">
              {SIZE_TIER_CONFIG.map((tier) => (
                <button
                  key={tier.key}
                  type="button"
                  aria-pressed={selectedSize === tier.key}
                  className={selectedSize === tier.key
                    ? "rounded-full bg-[#111011] px-4 py-2.5 text-sm font-semibold text-white shadow-sm"
                    : "rounded-full border border-black/10 bg-white px-4 py-2.5 text-sm font-semibold text-[#606266] transition hover:border-black/25 hover:text-[#111011]"}
                  onClick={() => setSelectedSize(tier.key)}
                >
                  <span className="sm:hidden">{tier.shortLabel}</span>
                  <span className="hidden sm:inline">{tier.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-4">
            {CORE_PACKAGE_IDS.map((packageId) => {
              const packageItem = PACKAGE_CONFIG.packages[packageId];
              const pricing = getPackagePricingForSize(packageItem, selectedSize);
              const featured = packageId === "signature";

              return (
                <article
                  key={packageItem.id}
                  className={featured
                    ? "relative overflow-hidden rounded-[1.5rem] bg-[#111011] p-6 text-white shadow-[0_24px_70px_rgba(0,0,0,0.18)]"
                    : "rounded-[1.5rem] border border-black/10 bg-white p-6"}
                >
                  {featured ? (
                    <div className="absolute right-0 top-0 rounded-bl-2xl bg-white px-3 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-[#111011]">
                      Most immersive
                    </div>
                  ) : null}
                  <p className={featured ? "text-xs font-semibold uppercase tracking-[0.14em] text-white/45" : "text-xs font-semibold uppercase tracking-[0.14em] text-[#828487]"}>
                    {pricing.photos}
                  </p>
                  <h3 className="mt-3 text-2xl font-semibold tracking-normal">{packageItem.name}</h3>
                  <p className={featured ? "mt-3 min-h-[72px] text-sm leading-6 text-white/65" : "mt-3 min-h-[72px] text-sm leading-6 text-[#606266]"}>
                    {packageItem.purpose}
                  </p>
                  <p className="mt-5 text-4xl font-semibold tracking-tight">{formatPrice(pricing.price)}</p>
                  <ul className="mt-6 space-y-3">
                    {packageItem.includes.slice(0, 4).map((item) => (
                      <li key={item} className={featured ? "flex gap-2 text-sm leading-5 text-white/75" : "flex gap-2 text-sm leading-5 text-[#606266]"}>
                        <Check className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.82fr_1.18fr]">
        <article className="relative overflow-hidden rounded-[2rem] border border-white bg-white p-7 shadow-soft-xl sm:p-9">
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#d6dbdc]/70 blur-3xl" />
          <div className="relative">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#111011] text-white">
              <Sparkles className="h-5 w-5" aria-hidden="true" />
            </div>
            <p className="mt-8 text-xs font-semibold uppercase tracking-[0.16em] text-[#828487]">Listing + personal brand</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-normal">The Influencer</h2>
            <p className="mt-4 text-base leading-7 text-[#606266]">{influencer.purpose}</p>
            <div className="mt-8 flex items-end justify-between gap-4 border-t border-black/10 pt-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#828487]">Selected size</p>
                <p className="mt-2 text-sm font-medium text-[#606266]">{influencerPricing.variant.label}</p>
              </div>
              <p className="text-4xl font-semibold tracking-tight">{formatPrice(influencerPricing.price)}</p>
            </div>
          </div>
        </article>

        <article className="rounded-[2rem] bg-[#111011] p-7 text-white shadow-[0_28px_90px_rgba(0,0,0,0.2)] sm:p-9">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/45">YouTube + content engine</p>
              <h2 className="mt-3 text-4xl font-semibold tracking-normal">Content Creator</h2>
              <p className="mt-4 text-base leading-7 text-white/65">{creator.purpose}</p>
            </div>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-[#111011]">
              <Youtube className="h-5 w-5" aria-hidden="true" />
            </div>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {creator.variants.map((tier) => (
              <div key={tier.key} className="rounded-2xl border border-white/12 bg-white/[0.07] p-5">
                <p className="text-sm font-semibold">{tier.label}</p>
                <p className="mt-3 text-2xl font-semibold">{formatPrice(tier.price)}</p>
                <p className="mt-3 text-xs leading-5 text-white/55">{tier.detail}</p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <article className="rounded-[2rem] border border-white bg-white p-4 shadow-soft-xl sm:p-6">
          <div className="h-full rounded-[1.5rem] border border-black/10 bg-[#fafafa] p-6 sm:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#828487]">Pre-listing packages</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-normal sm:text-4xl">Capture the curb appeal before the full launch.</h2>
                <p className="mt-3 text-sm leading-6 text-[#606266]">
                  Three clear ways to build early momentum, from a focused exterior set to a location-led preview.
                </p>
              </div>
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#111011] text-white">
                <MapPin className="h-5 w-5" aria-hidden="true" />
              </div>
            </div>

            <div className="mt-7 grid gap-3 md:grid-cols-3">
              {PRE_LISTING_PACKAGE_IDS.map((packageId) => {
                const packageItem = PACKAGE_CONFIG.packages[packageId];
                const price = packageItem.variants[0].price;

                return (
                  <div key={packageItem.id} className="rounded-2xl border border-black/10 bg-white p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#828487]">Coming soon</p>
                    <h3 className="mt-2 text-xl font-semibold tracking-normal">{packageItem.name}</h3>
                    <p className="mt-3 text-3xl font-semibold tracking-tight">{formatPrice(price)}</p>
                    <p className="mt-3 text-sm leading-6 text-[#606266]">{packageItem.purpose}</p>
                  </div>
                );
              })}
            </div>

            <p className="mt-5 rounded-2xl bg-[#f0f0f0] px-4 py-3 text-xs leading-5 text-[#606266]">
              Review note: Brian's latest Notion page names this section but does not list its rows. These three prices mirror the current live No Walls pricing page and should be confirmed if they changed.
            </p>
          </div>
        </article>

        <article className="rounded-[2rem] bg-[#111011] p-7 text-white shadow-[0_28px_90px_rgba(0,0,0,0.2)] sm:p-9">
          <div className="flex items-start justify-between gap-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/45">À la carte</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-normal sm:text-4xl">Photos only</h2>
              <p className="mt-3 text-sm leading-6 text-white/60">Choose the photo count that fits the property.</p>
            </div>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-[#111011]">
              <Camera className="h-5 w-5" aria-hidden="true" />
            </div>
          </div>

          <div className="mt-7 divide-y divide-white/10 rounded-2xl border border-white/10 bg-white/[0.06] px-5">
            {PHOTO_ONLY_OPTIONS.map((option) => (
              <div key={option.id} className="flex items-center justify-between gap-4 py-3.5">
                <div>
                  <p className="text-sm font-semibold capitalize">{option.photoCount}</p>
                  <p className="mt-0.5 text-xs text-white/42">{option.sizeLabel || "No size range listed"}</p>
                </div>
                <p className="text-lg font-semibold">{formatPrice(option.price)}</p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="rounded-[2rem] border border-white bg-white p-4 shadow-soft-xl sm:p-6">
        <div className="rounded-[1.5rem] bg-[#d6dbdc] p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#606266]">Video à la carte</p>
              <h2 className="mt-3 text-4xl font-semibold leading-tight tracking-normal sm:text-5xl">
                Choose the production level. Then choose the format.
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-[#606266]">
                Classic, Cinematic, and Influencer can be delivered horizontally or vertically. Lifestyle is the story-led option for showing more than the home.
              </p>
            </div>
            <div className="inline-flex rounded-full border border-black/10 bg-white p-1" role="group" aria-label="Video orientation preview">
              <button
                type="button"
                aria-pressed={orientation === "horizontal"}
                className={orientation === "horizontal" ? "flex items-center gap-2 rounded-full bg-[#111011] px-4 py-2.5 text-sm font-semibold text-white" : "flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-[#606266]"}
                onClick={() => setOrientation("horizontal")}
              >
                <MonitorPlay className="h-4 w-4" aria-hidden="true" />
                Horizontal
              </button>
              <button
                type="button"
                aria-pressed={orientation === "vertical"}
                className={orientation === "vertical" ? "flex items-center gap-2 rounded-full bg-[#111011] px-4 py-2.5 text-sm font-semibold text-white" : "flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-[#606266]"}
                onClick={() => setOrientation("vertical")}
              >
                <Smartphone className="h-4 w-4" aria-hidden="true" />
                Vertical Reel
              </button>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {VIDEO_LEVELS.map((level, index) => (
              <article key={level.name} className="rounded-[1.5rem] border border-black/10 bg-white p-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#111011] text-white">
                    {index === 0 ? <Video className="h-5 w-5" aria-hidden="true" /> : index === 1 ? <MonitorPlay className="h-5 w-5" aria-hidden="true" /> : index === 2 ? <Sparkles className="h-5 w-5" aria-hidden="true" /> : <MapPin className="h-5 w-5" aria-hidden="true" />}
                  </div>
                  <span className="rounded-full bg-[#f1f1f1] px-3 py-1 text-xs font-semibold text-[#606266]">
                    {level.supportsOrientation ? (orientation === "horizontal" ? "Horizontal" : "Vertical Reel") : "Story-led"}
                  </span>
                </div>
                <p className="mt-6 text-xs font-semibold uppercase tracking-[0.14em] text-[#828487]">{level.label}</p>
                <h3 className="mt-2 text-2xl font-semibold tracking-normal">{level.name}</h3>
                <p className="mt-3 text-sm leading-6 text-[#606266]">{level.description}</p>
                <div className="mt-6 flex items-end justify-between gap-3 border-t border-black/10 pt-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#828487]">À la carte</p>
                  <p className="text-2xl font-semibold tracking-tight">{formatPrice(level.price)}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-6 rounded-[2rem] bg-[#111011] p-7 text-white shadow-[0_28px_90px_rgba(0,0,0,0.2)] sm:p-9 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex max-w-3xl items-start gap-5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-[#111011]">
            <CalendarDays className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/45">Monthly Content Sessions</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-normal">A custom content rhythm, not another one-size-fits-all package.</h2>
            <p className="mt-3 text-base leading-7 text-white/65">
              Position monthly sessions as a tailored plan built around cadence, channels, and business goals. Pricing follows a short strategy conversation.
            </p>
          </div>
        </div>
        <button
          type="button"
          className="inline-flex h-14 shrink-0 items-center justify-center gap-2 rounded-full bg-white px-7 text-base font-medium text-[#111011] transition hover:bg-[#d6dbdc]"
          onClick={onBuild}
        >
          Build my recommendation
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </section>
    </div>
  );
}
