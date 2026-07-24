import { provideHttpClient } from "@angular/common/http";
import { TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";

import type { AnalysisResult } from "../../../contracts/analysis";
import { AnalysisStore } from "./core/state/analysis.store";
import { ResultPageComponent } from "./features/result/result-page.component";
import { UploadPageComponent } from "./features/upload/upload-page.component";

const result: AnalysisResult = {
  document: { name: "norma.txt", type: "text/plain", characters: 10 },
  summary: { totalRules: 0, requiresHumanReview: true },
  rules: [],
};

describe("keyboard and responsive essentials", () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UploadPageComponent, ResultPageComponent],
      providers: [provideHttpClient(), provideRouter([])],
    }).compileComponents();
  });

  it.each([320, 768, 1440])(
    "keeps essential controls available at %dpx",
    (width) => {
      Object.defineProperty(window, "innerWidth", {
        configurable: true,
        value: width,
      });
      window.dispatchEvent(new Event("resize"));

      const upload = TestBed.createComponent(UploadPageComponent);
      upload.detectChanges();
      const input = upload.nativeElement.querySelector(
        "input[type='file']",
      ) as HTMLInputElement;
      const submit = upload.nativeElement.querySelector(
        "button[type='submit']",
      ) as HTMLButtonElement;
      expect(upload.nativeElement.querySelector("main")).not.toBeNull();
      expect(input.labels?.[0]?.textContent).toContain("Selecione ou arraste");
      input.focus();
      expect(document.activeElement).toBe(input);
      upload.componentInstance.selectFile(
        new File(["regra"], "norma.txt", { type: "text/plain" }),
      );
      upload.detectChanges();
      submit.focus();
      expect(document.activeElement).toBe(submit);

      TestBed.inject(AnalysisStore).setResult(result);
      const results = TestBed.createComponent(ResultPageComponent);
      results.detectChanges();
      expect(results.nativeElement.querySelector("main")).not.toBeNull();
      expect(
        results.nativeElement.querySelector("[data-testid='human-review-notice']"),
      ).not.toBeNull();
      const restart = results.nativeElement.querySelector(
        ".page-actions button",
      ) as HTMLButtonElement;
      restart.focus();
      expect(document.activeElement).toBe(restart);
    },
  );
});
