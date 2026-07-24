import { provideHttpClient, withInterceptors } from "@angular/common/http";
import {
  HttpTestingController,
  provideHttpClientTesting,
} from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";

import { AnalysisApiService } from "../services/analysis-api.service";
import {
  AnalysisApiError,
  apiErrorInterceptor,
} from "./api-error.interceptor";

describe("apiErrorInterceptor", () => {
  it("maps a known error envelope", async () => {
    TestBed.configureTestingModule({
      providers: [
        AnalysisApiService,
        provideHttpClient(withInterceptors([apiErrorInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    const promise = TestBed.inject(AnalysisApiService).analyze(
      new File(["x"], "a.txt"),
    );
    TestBed.inject(HttpTestingController)
      .expectOne("/api/documents/analyze")
      .flush(
        {
          error: {
            code: "FILE_TOO_LARGE",
            message: "Muito grande.",
            requestId: "req-1",
          },
        },
        { status: 413, statusText: "Payload Too Large" },
      );
    await expect(promise).rejects.toEqual(
      expect.objectContaining<Partial<AnalysisApiError>>({
        code: "FILE_TOO_LARGE",
        requestId: "req-1",
      }),
    );
  });

  it("maps an unknown transport failure safely", async () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        AnalysisApiService,
        provideHttpClient(withInterceptors([apiErrorInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    const promise = TestBed.inject(AnalysisApiService).analyze(
      new File(["x"], "a.txt"),
    );
    TestBed.inject(HttpTestingController)
      .expectOne("/api/documents/analyze")
      .flush("raw failure", { status: 500, statusText: "Error" });
    await expect(promise).rejects.toEqual(
      expect.objectContaining({ code: "INTERNAL_ERROR", requestId: null }),
    );
  });
});
