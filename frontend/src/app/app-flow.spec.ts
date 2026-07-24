import { TestBed } from "@angular/core/testing";
import { provideRouter, Router } from "@angular/router";

import type { AnalysisResult } from "../../../contracts/analysis";
import { AnalysisApiService } from "./core/services/analysis-api.service";
import { AnalysisStore } from "./core/state/analysis.store";
import { ResultPageComponent } from "./features/result/result-page.component";
import { UploadPageComponent } from "./features/upload/upload-page.component";

const result: AnalysisResult = {
  document: { name: "norma.txt", type: "text/plain", characters: 50 },
  summary: { totalRules: 2, requiresHumanReview: true },
  rules: [
    {
      id: "R001",
      title: "Entrega obrigatória",
      description: "O setor deve entregar o relatório.",
      type: "obligation",
      evidence: "O setor deverá entregar o relatório.",
      location: { page: null, section: "Art. 1º" },
      subject: "Setor",
      action: "Entregar relatório",
      deadline: null,
      condition: null,
      exception: null,
      confidence: "high",
      requiresHumanReview: false,
    },
    {
      id: "R002",
      title: "Prazo de entrega",
      description: "A entrega ocorre em cinco dias.",
      type: "deadline",
      evidence: "O prazo para entrega será de cinco dias.",
      location: { page: null, section: "Art. 2º" },
      subject: "Setor",
      action: "Entregar relatório",
      deadline: "Cinco dias",
      condition: null,
      exception: null,
      confidence: "medium",
      requiresHumanReview: true,
    },
  ],
};

describe("main Angular flow", () => {
  it("covers upload, progress, result, local filter and restart", async () => {
    let resolveAnalysis!: (value: AnalysisResult) => void;
    const pendingResult = new Promise<AnalysisResult>((resolve) => {
      resolveAnalysis = resolve;
    });
    const api = { analyze: vi.fn(() => pendingResult) };

    await TestBed.configureTestingModule({
      imports: [UploadPageComponent, ResultPageComponent],
      providers: [
        provideRouter([]),
        { provide: AnalysisApiService, useValue: api },
      ],
    }).compileComponents();
    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, "navigate").mockResolvedValue(true);
    const store = TestBed.inject(AnalysisStore);
    const upload = TestBed.createComponent(UploadPageComponent);
    upload.componentInstance.selectFile(
      new File(["conteúdo"], "norma.txt", { type: "text/plain" }),
    );

    const analysis = upload.componentInstance.analyze();
    await Promise.resolve();
    upload.detectChanges();
    expect(store.status()).toBe("analyzing");
    expect(upload.nativeElement.querySelector("[role='status']").textContent)
      .toContain("Documento em análise");

    resolveAnalysis(result);
    await analysis;
    expect(store.status()).toBe("completed");
    expect(navigate).toHaveBeenCalledWith(["/resultado"]);

    const results = TestBed.createComponent(ResultPageComponent);
    results.detectChanges();
    const filter = results.nativeElement.querySelector("select") as HTMLSelectElement;
    filter.value = "deadline";
    filter.dispatchEvent(new Event("change"));
    results.detectChanges();
    expect(results.nativeElement.querySelectorAll("app-rule-card")).toHaveLength(1);
    expect(api.analyze).toHaveBeenCalledTimes(1);

    const restart = [...results.nativeElement.querySelectorAll("button")].find(
      (button: HTMLButtonElement) =>
        button.textContent?.includes("Analisar outro documento"),
    ) as HTMLButtonElement;
    restart.click();
    await results.whenStable();
    expect(store.result()).toBeNull();
    expect(store.selectedFile()).toBeNull();
    expect(navigate).toHaveBeenCalledWith(["/upload"]);
  });
});
