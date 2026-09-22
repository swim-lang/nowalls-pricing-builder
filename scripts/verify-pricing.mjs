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
    starter: { price: 195, variants: 7 },
    essentials: { price: 460, variants: 7 },
    signature: { price: 714, variants: 7 },
    premier: { price: 990, variants: 7 },
    influencer: { price: 609, variants: 7 },
    contentCreator: { price: 1295, variants: 3 },
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
  }

  assert.deepEqual(PACKAGE_CONFIG.packages.starter.variants.map((item) => item.price), [195, 229, 265, 300, 335, 370, 405]);
  assert.deepEqual(PACKAGE_CONFIG.packages.essentials.variants.map((item) => item.price), [460, 495, 530, 565, 600, 635, 670]);
  assert.deepEqual(PACKAGE_CONFIG.packages.signature.variants.map((item) => item.price), [714, 749, 784, 819, 854, 889, 924]);
  assert.deepEqual(PACKAGE_CONFIG.packages.premier.variants.map((item) => item.price), [990, 1025, 1060, 1095, 1130, 1165, 1200]);
  assert.deepEqual(PACKAGE_CONFIG.packages.influencer.variants.map((item) => item.price), [609, 644, 679, 714, 749, 784, 819]);
  assert.deepEqual(PACKAGE_CONFIG.packages.contentCreator.variants.map((item) => item.price), [1295, 1595, 1795]);

  const expectRecommendation = (answers, expectedPackage, expectedPrice, expectedPhotos, expectedStarting = false) => {
    const result = getRecommendation(answers);
    assert.equal(result.package.id, expectedPackage);
    assert.equal(result.estimatedPrice, expectedPrice);
    assert.equal(result.isStartingPrice, expectedStarting);
    if (expectedPhotos) assert.equal(result.photoCount, expectedPhotos);
  };

  expectRecommendation(
    { propertyType: "standard", goal: "essentials_only", socialImportance: "not_important", size: "1001_2000", knownNeeds: ["photos"] },
    "starter",
    229,
    "30 photos",
  );

  expectRecommendation(
    { propertyType: "standard", goal: "polished", socialImportance: "not_important", size: "2001_3000", knownNeeds: ["photos", "floor_plan"] },
    "essentials",
    530,
    "40 photos",
  );

  expectRecommendation(
    { propertyType: "standard", goal: "sell_fast", socialImportance: "not_important", size: "6001_8000", knownNeeds: ["video", "drone", "website"] },
    "signature",
    889,
    "55 photos",
  );

  expectRecommendation(
    { propertyType: "luxury", goal: "premium", socialImportance: "major", size: "over_8000", knownNeeds: ["video", "drone", "website", "social_reels"] },
    "premier",
    1200,
    "60 photos",
  );

  expectRecommendation(
    { propertyType: "standard", goal: "personal_brand", socialImportance: "major", size: "3001_4000", knownNeeds: ["social_reels"] },
    "influencer",
    714,
    "45 photos",
  );

  expectRecommendation(
    { propertyType: "short_term_rental", goal: "premium", socialImportance: "very", size: "4000_6000", knownNeeds: ["photos", "video"] },
    "influencer",
    749,
    "50 photos",
  );

  expectRecommendation(
    { propertyType: "standard", goal: "long_form", socialImportance: "major", size: "2001_3000", knownNeeds: ["long_form", "social_reels"] },
    "contentCreator",
    1295,
    "Horizontal + vertical photos",
    true,
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

  console.log("No Walls September pricing tiers and review-mode recommendations verified.");
} finally {
  await rm(tempDirectory, { recursive: true, force: true });
}
