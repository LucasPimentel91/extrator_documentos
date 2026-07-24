import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { firstValueFrom } from "rxjs";

import type { AnalysisResult } from "../../../../../contracts/analysis";

@Injectable({ providedIn: "root" })
export class AnalysisApiService {
  private readonly http = inject(HttpClient);

  analyze(file: File): Promise<AnalysisResult> {
    const body = new FormData();
    body.append("file", file, file.name);
    return firstValueFrom(
      this.http.post<AnalysisResult>("/api/documents/analyze", body),
    );
  }
}
