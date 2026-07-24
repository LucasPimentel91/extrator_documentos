import { Component, inject, OnInit } from "@angular/core";
import { Router } from "@angular/router";

import { AnalysisStore } from "../../core/state/analysis.store";
import { HumanReviewNoticeComponent } from "../../shared/components/human-review-notice.component";
import { ResultSummaryComponent } from "./result-summary.component";
import { RuleCardComponent } from "./rule-card.component";

@Component({
  selector: "app-result-page",
  standalone: true,
  imports: [
    HumanReviewNoticeComponent,
    ResultSummaryComponent,
    RuleCardComponent,
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
            <div class="rule-list">
              @for (rule of result.rules; track rule.id) {
                <app-rule-card [rule]="rule" />
              }
            </div>
          </section>
        }
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

    .rule-list {
      display: grid;
      gap: 1rem;
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
}
