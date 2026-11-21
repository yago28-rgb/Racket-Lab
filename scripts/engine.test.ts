/**
 * Engine sanity tests. Run with: npm run test:engine
 * Uses Node's built-in test runner via tsx (resolves the @/ path alias).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { products } from "../src/data/products";
import { recommend } from "../src/lib/recommendation/engine";
import { emptyAnswers, type FinderAnswers } from "../src/lib/recommendation/types";

const base: FinderAnswers = { ...emptyAnswers };

test("scores are bounded and sorted", () => {
  const r = recommend(products, { ...base, level: "intermediate", style: "all-court" });
  assert.ok(r.ranked.length > 0);
  for (const s of r.ranked) {
    assert.ok(s.compatibility >= 0 && s.compatibility <= 100, `${s.racket.id}: ${s.compatibility}`);
  }
  for (let i = 1; i < r.ranked.length; i++) {
    assert.ok(r.ranked[i - 1].compatibility >= r.ranked[i].compatibility);
  }
});

test("beginners never get ≥310 g or <98 in² frames", () => {
  const r = recommend(products, { ...base, level: "beginner", style: "defensive", weight: "auto" });
  for (const s of r.ranked) {
    assert.ok((s.racket.specs.weightUnstrungG ?? 0) < 310, s.racket.id);
    assert.ok((s.racket.specs.headSizeSqIn ?? 100) >= 98, s.racket.id);
  }
});

test("control-seeking advanced player gets a control/dense frame first", () => {
  const r = recommend(products, {
    ...base,
    level: "advanced",
    style: "control",
    weight: "300-315",
    powerControl: 95,
    feel: ["control", "classic"],
    head: "85-97",
  });
  const best = r.best!.racket;
  assert.ok((best.specs.headSizeSqIn ?? 0) <= 99, `got ${best.id}`);
  assert.ok(["control", "comfort"].includes(best.type), `got ${best.id} (${best.type})`);
});

test("power/spin baseliner gets a 100 in² frame first", () => {
  const r = recommend(products, {
    ...base,
    level: "intermediate",
    style: "baseline-aggressive",
    weight: "285-300",
    powerControl: 10,
    feel: ["spin", "power"],
    head: "98-100",
  });
  assert.equal(r.best!.racket.specs.headSizeSqIn, 100, `got ${r.best!.racket.id}`);
});

test("arm issues favour low-stiffness frames", () => {
  const r = recommend(products, { ...base, level: "intermediate", style: "all-court", armIssues: true, feel: ["comfort"] });
  const top = r.topThree.map((s) => s.racket.specs.stiffnessRA ?? 99);
  assert.ok(Math.min(...top) <= 62, `top RA: ${top.join(",")}`);
});

test("missing swingweight lowers confidence", () => {
  const r = recommend(products, { ...base, level: "intermediate", style: "serve-volley", feel: ["stability"] });
  const tfx = r.ranked.find((s) => s.racket.id === "tec-tfx1-300-v2");
  const full = r.ranked.find((s) => s.racket.id === "head-speed-mp-2024");
  if (tfx && full) assert.ok(tfx.confidence < full.confidence);
});
