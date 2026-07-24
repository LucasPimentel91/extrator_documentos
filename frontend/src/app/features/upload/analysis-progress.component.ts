import { Component, Input } from "@angular/core";

import type { AnalysisStatus } from "../../core/state/analysis.store";

@Component({
  selector: "app-analysis-progress",
  standalone: true,
  template: `
    @if (status === "uploading") {
      <p role="status" aria-live="polite">Enviando documento…</p>
    } @else if (status === "analyzing") {
      <p role="status" aria-live="polite">Documento em análise…</p>
    }
  `,
})
export class AnalysisProgressComponent {
  @Input({ required: true }) status!: AnalysisStatus;
}
