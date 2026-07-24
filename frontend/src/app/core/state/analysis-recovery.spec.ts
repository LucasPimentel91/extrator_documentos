import { TestBed } from "@angular/core/testing";
import { provideRouter, Router } from "@angular/router";

import type { AnalysisResult } from "../../../../../contracts/analysis";
import { AnalysisApiError } from "../interceptors/api-error.interceptor";
import { AnalysisStore } from "./analysis.store";

const result: AnalysisResult = {
  document: { name: "norma.txt", type: "text/plain", characters: 20 },
  summary: { totalRules: 0, requiresHumanReview: true },
  rules: [],
};

describe("AnalysisStore recovery", () => {
  let store: AnalysisStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([])],
    });
    store = TestBed.inject(AnalysisStore);
  });

  it("prepares a controlled retry while retaining only the selected file", () => {
    const file = new File(["regra"], "norma.txt", { type: "text/plain" });
    store.selectFile(file);
    store.setResult(result);
    store.setFilter("penalty");
    store.setError(new AnalysisApiError("AI_TIMEOUT", "req-1", "Timeout"));

    expect(store.prepareRetry()).toBe(true);
    expect(store.selectedFile()).toBe(file);
    expect(store.status()).toBe("ready");
    expect(store.error()).toBeNull();
    expect(store.result()).toBeNull();
    expect(store.filter()).toBe("all");
  });

  it("does not retry without a selected file or while busy", () => {
    expect(store.prepareRetry()).toBe(false);

    store.selectFile(new File(["x"], "a.txt"));
    store.setStatus("analyzing");
    expect(store.prepareRetry()).toBe(false);
  });

  it("clears file, result, error and filter before navigating to upload", async () => {
    const navigate = vi
      .spyOn(TestBed.inject(Router), "navigate")
      .mockResolvedValue(true);
    store.selectFile(new File(["x"], "a.txt"));
    store.setResult(result);
    store.setFilter("deadline");
    store.setError(new AnalysisApiError("AI_UNAVAILABLE", "req-2", "Falha"));

    await store.reset();

    expect(store.selectedFile()).toBeNull();
    expect(store.result()).toBeNull();
    expect(store.error()).toBeNull();
    expect(store.filter()).toBe("all");
    expect(store.status()).toBe("empty");
    expect(navigate).toHaveBeenCalledWith(["/upload"]);
  });
});
