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

  const matrixExpectations = {
    starter: [195, 229, 265, 300, 335, 370, 405],
    essentials: [460, 495, 530, 565, 600, 635, 670],
    signature: [714, 749, 784, 819, 854, 889, 924],
    premier: [990, 1025, 1060, 1095, 1130, 1165, 1200],
    casualScroller: [395, 430, 465, 500, 535, 570, 605],
    contentPro: [595, 630, 665, 700, 735, 770, 805],
    influencer: [695, 730, 765, 800, 835, 870, 905],
  };

  for (const [packageId, prices] of Object.entries(matrixExpectations)) {
    const actual = Object.values(PACKAGE_CONFIG.packages[packageId].pricing).map((entry) => entry.price);
    assert.deepEqual(actual, prices, `${packageId} price matrix changed`);
  }

  const expectRecommendation = (answers, expectedPackage, expectedPrice, expectedPhotos) => {
    const result = getRecommendation(answers);
    assert.equal(result.package.id, expectedPackage);
    assert.equal(result.estimatedPrice, expectedPrice);
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
    800,
    "45 photos",
  );

  expectRecommendation(
    { propertyType: "short_term_rental", goal: "premium", socialImportance: "very", size: "4000_6000", knownNeeds: ["photos", "video"] },
    "airbnbSuperHostPlus",
    595,
  );

  expectRecommendation(
    { propertyType: "land", goal: "essentials_only", socialImportance: "not_important", size: "not_sure", knownNeeds: ["photos", "drone"] },
    "lot",
    249,
  );

  expectRecommendation(
    { propertyType: "pre_listing", goal: "polished", socialImportance: "somewhat", size: "not_sure", knownNeeds: ["photos", "video"] },
    "preListing",
    129,
  );

  console.log("No Walls pricing matrices and recommendation paths verified.");
} finally {
  await rm(tempDirectory, { recursive: true, force: true });
}
