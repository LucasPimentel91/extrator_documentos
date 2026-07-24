import { TestBed } from "@angular/core/testing";
import { provideRouter, Router } from "@angular/router";

import {
  RULE_TYPES,
  type AnalysisResult,
  type ExtractedRule,
  type RuleType,
} from "../../../../../contracts/analysis";
import { AnalysisStore } from "./analysis.store";

function rule(type: RuleType, index: number): ExtractedRule {
  return {
    id: `R${String(index + 1).padStart(3, "0")}`,
    title: `Regra ${type}`,
    description: `Descrição ${type}`,
    type,
    evidence: `Evidência ${type}`,
    location: { page: index + 1, section: null },
    subject: null,
    action: null,
    deadline: null,
    condition: null,
    exception: null,
    confidence: "high",
    requiresHumanReview: true,
  };
}

const mixedResult: AnalysisResult = {
  document: {
    name: "norma.txt",
    type: "text/plain",
    characters: 1000,
  },
  summary: {
    totalRules: RULE_TYPES.length,
    requiresHumanReview: true,
  },
  rules: RULE_TYPES.map(rule),
};

describe("AnalysisStore result filtering", () => {
  let store: AnalysisStore;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideRouter([])],
    });
    store = TestBed.inject(AnalysisStore);
    store.setResult(mixedResult);
  });

  it.each(RULE_TYPES)("filters the %s rule type locally", (type) => {
    store.setFilter(type);

    expect(store.filteredRules().map((item) => item.type)).toEqual([type]);
    expect(store.filteredTotal()).toBe(1);
    expect(store.result()?.rules).toHaveLength(RULE_TYPES.length);
  });

  it("restores every rule with the all filter", () => {
    store.setFilter("penalty");
    store.setFilter("all");

    expect(store.filteredRules()).toEqual(mixedResult.rules);
    expect(store.filteredTotal()).toBe(RULE_TYPES.length);
    expect(store.totalRules()).toBe(RULE_TYPES.length);
  });

  it("returns an empty derived list when no rule matches", () => {
    store.setResult({
      ...mixedResult,
      summary: { ...mixedResult.summary, totalRules: 1 },
      rules: [rule("obligation", 0)],
    });
    store.setFilter("penalty");

    expect(store.filteredRules()).toEqual([]);
    expect(store.filteredTotal()).toBe(0);
    expect(store.totalRules()).toBe(1);
  });

  it("derives safe empty totals when there is no result", async () => {
    vi.spyOn(TestBed.inject(Router), "navigate").mockResolvedValue(true);
    await store.reset();

    expect(store.filteredRules()).toEqual([]);
    expect(store.filteredTotal()).toBe(0);
    expect(store.totalRules()).toBe(0);
  });

  it("restores the last completed result from session storage", () => {
    store.setResult(mixedResult);
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideRouter([])],
    });

    const restored = TestBed.inject(AnalysisStore);

    expect(restored.status()).toBe("completed");
    expect(restored.result()).toEqual(mixedResult);
  });

  it("clears the stored result when selecting another file", () => {
    store.setResult(mixedResult);
    store.selectFile(new File(["nova"], "nova.txt", { type: "text/plain" }));
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideRouter([])],
    });

    const restored = TestBed.inject(AnalysisStore);

    expect(restored.status()).toBe("empty");
    expect(restored.result()).toBeNull();
  });
});
