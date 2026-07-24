import { Component, input } from "@angular/core";

import type { AnalysisSummary } from "../../../../../contracts/analysis";

@Component({
  selector: "app-result-summary",
  standalone: true,
  template: `
    <section
      class="summary"
      data-testid="result-summary"
      aria-labelledby="result-summary-title"
    >
      <h2 id="result-summary-title">Resumo da análise</h2>
      @if (summary().totalRules === 0) {
        <div class="empty-state" role="status">
          <strong>Nenhuma regra encontrada</strong>
          <p>
            A análise automatizada não identificou regras. Ainda assim, revise o
            documento original.
          </p>
        </div>
      } @else {
        <p class="total">
          <strong>{{ summary().totalRules }}</strong>
          {{ summary().totalRules === 1 ? "regra identificada" : "regras identificadas" }}
        </p>
      }
      @if (summary().requiresHumanReview) {
        <p class="review-status">Revisão humana necessária</p>
      }
    </section>
  `,
  styles: `
    .summary {
      padding: 1rem;
      border: 1px solid #cbd5e1;
      border-radius: 0.75rem;
      background: #f8fafc;
    }

    .summary h2,
    .summary p {
      margin-top: 0;
    }

    .summary p:last-child {
      margin-bottom: 0;
    }

    .total strong {
      font-size: 1.75rem;
    }

    .review-status {
      font-weight: 600;
      color: #7c2d12;
    }

    .empty-state {
      padding-left: 0.75rem;
      border-left: 0.25rem solid #b45309;
    }
  `,
})
export class ResultSummaryComponent {
  readonly summary = input.required<AnalysisSummary>();
}
