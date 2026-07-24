import { Component, inject, OnInit } from "@angular/core";
import { Router } from "@angular/router";

import { AnalysisStore } from "../../core/state/analysis.store";
import { HumanReviewNoticeComponent } from "../../shared/components/human-review-notice.component";
import { ResultSummaryComponent } from "./result-summary.component";
import { RuleCardComponent } from "./rule-card.component";
import { RuleFilterComponent } from "./rule-filter.component";

@Component({
  selector: "app-result-page",
  standalone: true,
  imports: [
    HumanReviewNoticeComponent,
    ResultSummaryComponent,
    RuleCardComponent,
    RuleFilterComponent,
  ],
  template: `
    @if (store.result(); as result) {
      <main class="result-page">
        <header>
          <p class="eyebrow">Documento analisado</p>
          <h1>Resultado da análise</h1>
          <p class="document-name">{{ result.document.name }}</p>
        </header>

        <app-human-review-notice />
        <app-result-summary [summary]="result.summary" />

        @if (result.rules.length > 0) {
          <section class="rules" aria-labelledby="rules-title">
            <h2 id="rules-title">Regras identificadas</h2>
            <app-rule-filter
              [selected]="store.filter()"
              (filterChange)="store.setFilter($event)"
            />
            <p class="filter-count" role="status" aria-live="polite">
              Exibindo {{ store.filteredTotal() }} de
              {{ store.totalRules() }}
              {{ store.totalRules() === 1 ? "regra" : "regras" }}
            </p>
            <div class="rule-list">
              @for (rule of store.filteredRules(); track rule.id) {
                <app-rule-card [rule]="rule" />
              } @empty {
                <p class="empty-filter" data-testid="no-filter-results">
                  Nenhuma regra corresponde à categoria selecionada.
                </p>
              }
            </div>
          </section>
        }

        <div class="page-actions">
          <button type="button" (click)="analyzeAnother()">
            Analisar outro documento
          </button>
        </div>
      </main>
    }
  `,
  styles: `
    .result-page {
      box-sizing: border-box;
      width: min(100% - 2rem, 70rem);
      margin: 0 auto;
      padding: 2rem 0 4rem;
      display: grid;
      gap: 1.5rem;
    }

    h1 {
      margin: 0;
    }

    .eyebrow {
      margin-bottom: 0.25rem;
      color: #475569;
      font-weight: 600;
    }

    .document-name {
      margin-bottom: 0;
      overflow-wrap: anywhere;
    }

    .rules h2 {
      margin-top: 0;
    }

    .rules {
      display: grid;
      gap: 1rem;
    }

    .filter-count {
      margin: 0;
      color: #475569;
    }

    .rule-list {
      display: grid;
      gap: 1rem;
    }

    .empty-filter {
      margin: 0;
      padding: 1rem;
      border: 1px dashed #64748b;
      border-radius: 0.5rem;
    }

    .page-actions {
      display: flex;
      justify-content: flex-start;
    }

    .page-actions button {
      min-height: 2.75rem;
      padding: 0.625rem 1rem;
    }

    @media (max-width: 30rem) {
      .result-page {
        width: min(100% - 1rem, 70rem);
        padding-top: 1rem;
      }
    }
  `,
})
export class ResultPageComponent implements OnInit {
  readonly store = inject(AnalysisStore);
  private readonly router = inject(Router);

  ngOnInit(): void {
    if (!this.store.hasResult()) {
      void this.router.navigate(["/upload"]);
    }
  }

  async analyzeAnother(): Promise<void> {
    await this.store.reset();
  }
}
