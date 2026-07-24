import { computed, inject, Injectable, signal } from "@angular/core";
import { Router } from "@angular/router";

import type {
  AnalysisResult,
  RuleType,
} from "../../../../../contracts/analysis";
import type { AnalysisApiError } from "../interceptors/api-error.interceptor";

export type AnalysisStatus =
  | "empty"
  | "file-selected"
  | "validating"
  | "ready"
  | "uploading"
  | "analyzing"
  | "completed"
  | "failed";

export type RuleFilter = RuleType | "all";

@Injectable({ providedIn: "root" })
export class AnalysisStore {
  private readonly router = inject(Router);
  private readonly selectedFileState = signal<File | null>(null);
  private readonly statusState = signal<AnalysisStatus>("empty");
  private readonly resultState = signal<AnalysisResult | null>(null);
  private readonly errorState = signal<AnalysisApiError | null>(null);
  private readonly filterState = signal<RuleFilter>("all");

  readonly selectedFile = this.selectedFileState.asReadonly();
  readonly status = this.statusState.asReadonly();
  readonly result = this.resultState.asReadonly();
  readonly error = this.errorState.asReadonly();
  readonly filter = this.filterState.asReadonly();
  readonly hasResult = computed(() => this.resultState() !== null);
  readonly totalRules = computed(
    () => this.resultState()?.summary.totalRules ?? 0,
  );
  readonly filteredRules = computed(() => {
    const rules = this.resultState()?.rules ?? [];
    const filter = this.filterState();
    return filter === "all"
      ? rules
      : rules.filter((rule) => rule.type === filter);
  });
  readonly filteredTotal = computed(() => this.filteredRules().length);

  selectFile(file: File): void {
    this.selectedFileState.set(file);
    this.statusState.set("file-selected");
    this.resultState.set(null);
    this.errorState.set(null);
    this.filterState.set("all");
  }

  clearSelection(): void {
    this.selectedFileState.set(null);
    this.statusState.set("empty");
    this.resultState.set(null);
    this.errorState.set(null);
    this.filterState.set("all");
  }

  setStatus(status: AnalysisStatus): void {
    this.statusState.set(status);
  }

  setResult(result: AnalysisResult): void {
    this.resultState.set(result);
    this.filterState.set("all");
    this.statusState.set("completed");
    this.errorState.set(null);
  }

  setError(error: AnalysisApiError): void {
    this.errorState.set(error);
    this.resultState.set(null);
    this.filterState.set("all");
    this.statusState.set("failed");
  }

  setFilter(filter: RuleFilter): void {
    this.filterState.set(filter);
  }

  prepareRetry(): boolean {
    if (this.statusState() !== "failed" || !this.selectedFileState()) {
      return false;
    }
    this.resultState.set(null);
    this.errorState.set(null);
    this.filterState.set("all");
    this.statusState.set("ready");
    return true;
  }

  async reset(): Promise<void> {
    this.clearSelection();
    await this.router.navigate(["/upload"]);
  }
}
