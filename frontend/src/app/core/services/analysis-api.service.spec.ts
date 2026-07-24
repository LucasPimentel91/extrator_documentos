import { provideHttpClient } from "@angular/common/http";
import {
  HttpTestingController,
  provideHttpClientTesting,
} from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";

import { AnalysisApiService } from "./analysis-api.service";

describe("AnalysisApiService", () => {
  it("posts multipart and returns the typed result", async () => {
    TestBed.configureTestingModule({
      providers: [
        AnalysisApiService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    const service = TestBed.inject(AnalysisApiService);
    const http = TestBed.inject(HttpTestingController);
    const promise = service.analyze(
      new File(["texto"], "a.txt", { type: "text/plain" }),
    );
    const request = http.expectOne("/api/documents/analyze");
    expect(request.request.method).toBe("POST");
    expect(request.request.body).toBeInstanceOf(FormData);
    request.flush({
      document: { name: "a.txt", type: "text/plain", characters: 5 },
      summary: { totalRules: 0, requiresHumanReview: true },
      rules: [],
    });
    await expect(promise).resolves.toMatchObject({
      summary: { totalRules: 0 },
    });
    http.verify();
  });
});
