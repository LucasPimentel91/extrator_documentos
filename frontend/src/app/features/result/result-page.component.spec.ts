import { TestBed } from "@angular/core/testing";
import { provideRouter, Router } from "@angular/router";

import type { AnalysisResult } from "../../../../../contracts/analysis";
import { AnalysisStore } from "../../core/state/analysis.store";
import { ResultPageComponent } from "./result-page.component";

const result: AnalysisResult = {
  document: {
    name: "regulamento.pdf",
    type: "application/pdf",
    characters: 840,
  },
  summary: { totalRules: 1, requiresHumanReview: true },
  rules: [
    {
      id: "R001",
      title: "Prazo de recurso",
      description: "O recurso deve ser apresentado em cinco dias.",
      type: "deadline",
      evidence: "O recurso deverá ser interposto no prazo de cinco dias.",
      location: { page: 2, section: null },
      subject: null,
      action: "Interpor recurso",
      deadline: "Cinco dias",
      condition: null,
      exception: null,
      confidence: "medium",
      requiresHumanReview: true,
    },
  ],
};

describe("ResultPageComponent", () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResultPageComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it("shows the legal notice and detailed result without a new request", () => {
    const store = TestBed.inject(AnalysisStore);
    store.setResult(result);
    const fixture = TestBed.createComponent(ResultPageComponent);
    fixture.detectChanges();

    const page = fixture.nativeElement as HTMLElement;
    const notice = page.querySelector("[data-testid='human-review-notice']");
    expect(notice?.textContent).toContain(
      "não substitui revisão humana nem interpretação jurídica",
    );
    expect(page.querySelectorAll("app-rule-card")).toHaveLength(1);
    expect(page.textContent).toContain("regulamento.pdf");
  });

  it("redirects direct navigation when there is no result in memory", () => {
    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, "navigate").mockResolvedValue(true);
    const fixture = TestBed.createComponent(ResultPageComponent);
    fixture.detectChanges();

    expect(navigate).toHaveBeenCalledWith(["/upload"]);
  });
});
