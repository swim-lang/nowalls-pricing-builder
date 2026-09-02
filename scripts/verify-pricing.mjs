import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { build } from "esbuild";

const tempDirectory = await mkdtemp(path.join(os.tmpdir(), "nowalls-pricing-"));
const bundlePath = path.join(tempDirectory, "pricing.mjs");

try {
  await build({
    entryPoints: ["src/components/pricing/PricingBuilder.tsx"],
    bundle: true,
    outfile: bundlePath,
    format: "esm",
    platform: "node",
    logLevel: "silent",
  });

  const { getRecommendation, PACKAGE_CONFIG } = await import(pathToFileURL(bundlePath).href);

  const packageExpectations = {
    starter: { price: 209, variants: 1 },
    essentials: { price: 495, variants: 4 },
    signature: { price: 749, variants: 4 },
    premier: { price: 1195, variants: 2 },
    casualScroller: { price: 395, variants: 1 },
    contentPro: { price: 595, variants: 1 },
    influencer: { price: 695, variants: 1 },
    landPackage: { price: 495, variants: 1 },
    lot: { price: 179, variants: 1 },
    locationPackage: { price: 249, variants: 1 },
    preListing: { price: 349, variants: 1 },
    exteriorPhotos: { price: 89, variants: 1 },
  };

  assert.deepEqual(Object.keys(PACKAGE_CONFIG.packages).sort(), Object.keys(packageExpectations).sort());

  for (const [packageId, expected] of Object.entries(packageExpectations)) {
    const packageConfig = PACKAGE_CONFIG.packages[packageId];
    assert.equal(packageConfig.variants[0].price, expected.price, `${packageId} price changed`);
    assert.equal(packageConfig.variants.length, expected.variants, `${packageId} variant count changed`);
    assert.ok(packageConfig.variants.every((variant) => variant.price === expected.price), `${packageId} variants must share the reviewed live price`);
  }

  const expectRecommendation = (answers, expectedPackage, expectedPrice, expectedPhotos) => {
    const result = getRecommendation(answers);
    assert.equal(result.package.id, expectedPackage);
    assert.equal(result.estimatedPrice, expectedPrice);
    assert.equal(result.isStartingPrice, false);
    if (expectedPhotos) assert.equal(result.photoCount, expectedPhotos);
  };

  expectRecommendation(
    { propertyType: "standard", goal: "essentials_only", socialImportance: "not_important", size: "1001_2000", knownNeeds: ["photos"] },
    "starter",
    209,
    "Up to 25 photos",
  );

  expectRecommendation(
    { propertyType: "standard", goal: "polished", socialImportance: "not_important", size: "2001_3000", knownNeeds: ["photos", "floor_plan"] },
    "essentials",
    495,
    "Up to 35 photos",
  );

  expectRecommendation(
    { propertyType: "standard", goal: "sell_fast", socialImportance: "not_important", size: "6001_8000", knownNeeds: ["video", "drone", "website"] },
    "signature",
    749,
    "Up to 40 photos",
  );

  expectRecommendation(
    { propertyType: "luxury", goal: "premium", socialImportance: "major", size: "over_8000", knownNeeds: ["video", "drone", "website", "social_reels"] },
    "premier",
    1195,
    "Up to 45 photos",
  );

  expectRecommendation(
    { propertyType: "standard", goal: "personal_brand", socialImportance: "major", size: "3001_4000", knownNeeds: ["social_reels"] },
    "influencer",
    695,
    "Up to 40 photos",
  );

  expectRecommendation(
    { propertyType: "short_term_rental", goal: "premium", socialImportance: "very", size: "4000_6000", knownNeeds: ["photos", "video"] },
    "contentPro",
    595,
    "Up to 35 photos",
  );

  expectRecommendation(
    { propertyType: "land", goal: "essentials_only", socialImportance: "not_important", size: "not_sure", knownNeeds: ["photos", "drone"] },
    "lot",
    179,
    "Up to 20 photos",
  );

  expectRecommendation(
    { propertyType: "pre_listing", goal: "essentials_only", socialImportance: "not_important", size: "not_sure", knownNeeds: ["photos"] },
    "exteriorPhotos",
    89,
    "Up to 10 photos",
  );

  expectRecommendation(
    { propertyType: "pre_listing", goal: "polished", socialImportance: "somewhat", size: "not_sure", knownNeeds: ["photos", "video"] },
    "preListing",
    349,
  );

  console.log("No Walls live-catalog package prices, variants, and recommendations verified.");
} finally {
  await rm(tempDirectory, { recursive: true, force: true });
}
