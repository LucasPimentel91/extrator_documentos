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

const ANALYSIS_RESULT_STORAGE_KEY = "analysis:last-result";

function clearStoredResult(): void {
  try {
    globalThis.sessionStorage?.removeItem(ANALYSIS_RESULT_STORAGE_KEY);
  } catch {
    // Browsers can deny sessionStorage; nothing else is required.
  }
}

function readStoredResult(): AnalysisResult | null {
  try {
    const raw = globalThis.sessionStorage?.getItem(ANALYSIS_RESULT_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<AnalysisResult>;
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      typeof parsed.document?.name === "string" &&
      typeof parsed.document?.type === "string" &&
      typeof parsed.document?.characters === "number" &&
      typeof parsed.summary?.totalRules === "number" &&
      typeof parsed.summary?.requiresHumanReview === "boolean" &&
      Array.isArray(parsed.rules)
    ) {
      return parsed as AnalysisResult;
    }
  } catch {
    clearStoredResult();
  }
  return null;
}

function writeStoredResult(result: AnalysisResult): void {
  try {
    globalThis.sessionStorage?.setItem(
      ANALYSIS_RESULT_STORAGE_KEY,
      JSON.stringify(result),
    );
  } catch {
    // Browsers can deny sessionStorage; in-memory state still works.
  }
}

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

  constructor() {
    const storedResult = readStoredResult();
    if (storedResult) {
      this.resultState.set(storedResult);
      this.statusState.set("completed");
    }
  }

  selectFile(file: File): void {
    this.selectedFileState.set(file);
    this.statusState.set("file-selected");
    this.resultState.set(null);
    this.errorState.set(null);
    this.filterState.set("all");
    clearStoredResult();
  }

  clearSelection(): void {
    this.selectedFileState.set(null);
    this.statusState.set("empty");
    this.resultState.set(null);
    this.errorState.set(null);
    this.filterState.set("all");
    clearStoredResult();
  }

  setStatus(status: AnalysisStatus): void {
    this.statusState.set(status);
  }

  setResult(result: AnalysisResult): void {
    this.resultState.set(result);
    this.filterState.set("all");
    this.statusState.set("completed");
    this.errorState.set(null);
    writeStoredResult(result);
  }

  setError(error: AnalysisApiError): void {
    this.errorState.set(error);
    this.resultState.set(null);
    this.filterState.set("all");
    this.statusState.set("failed");
    clearStoredResult();
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
    clearStoredResult();
    return true;
  }

  async reset(): Promise<void> {
    this.clearSelection();
    await this.router.navigate(["/upload"]);
  }
}
