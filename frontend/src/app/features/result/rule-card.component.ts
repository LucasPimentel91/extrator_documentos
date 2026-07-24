import { Component, input } from "@angular/core";

import type {
  Confidence,
  ExtractedRule,
  RuleType,
} from "../../../../../contracts/analysis";

const RULE_TYPE_LABELS: Record<RuleType, string> = {
  obligation: "Obrigação",
  prohibition: "Proibição",
  permission: "Permissão",
  deadline: "Prazo",
  condition: "Condição",
  exception: "Exceção",
  procedure: "Procedimento",
  definition: "Definição normativa",
  penalty: "Penalidade",
};

const CONFIDENCE_LABELS: Record<Confidence, string> = {
  high: "Alta",
  medium: "Média",
  low: "Baixa",
};

@Component({
  selector: "app-rule-card",
  standalone: true,
  template: `
    <article
      class="rule-card"
      [attr.aria-labelledby]="'rule-' + rule().id + '-title'"
    >
      <header>
        <span class="rule-id">{{ rule().id }}</span>
        <span class="rule-type">{{ typeLabel(rule().type) }}</span>
        <h3 [id]="'rule-' + rule().id + '-title'">{{ rule().title }}</h3>
      </header>

      <p>{{ rule().description }}</p>

      <section aria-label="Evidência da regra">
        <h4>Trecho original</h4>
        <blockquote>{{ rule().evidence }}</blockquote>
      </section>

      <dl>
        <div>
          <dt>Página</dt>
          @if (rule().location.page; as page) {
            <dd>Página {{ page }}</dd>
          } @else {
            <dd data-missing="true">Não identificado</dd>
          }
        </div>
        <div>
          <dt>Seção</dt>
          @if (rule().location.section; as section) {
            <dd>{{ section }}</dd>
          } @else {
            <dd data-missing="true">Não identificado</dd>
          }
        </div>
        <div>
          <dt>Sujeito responsável</dt>
          <dd [attr.data-missing]="rule().subject === null ? 'true' : null">
            {{ valueOrMissing(rule().subject) }}
          </dd>
        </div>
        <div>
          <dt>Ação</dt>
          <dd [attr.data-missing]="rule().action === null ? 'true' : null">
            {{ valueOrMissing(rule().action) }}
          </dd>
        </div>
        <div>
          <dt>Prazo</dt>
          <dd [attr.data-missing]="rule().deadline === null ? 'true' : null">
            {{ valueOrMissing(rule().deadline) }}
          </dd>
        </div>
        <div>
          <dt>Condição</dt>
          <dd [attr.data-missing]="rule().condition === null ? 'true' : null">
            {{ valueOrMissing(rule().condition) }}
          </dd>
        </div>
        <div>
          <dt>Exceção</dt>
          <dd [attr.data-missing]="rule().exception === null ? 'true' : null">
            {{ valueOrMissing(rule().exception) }}
          </dd>
        </div>
        <div>
          <dt>Confiança</dt>
          <dd>{{ confidenceLabel(rule().confidence) }}</dd>
        </div>
      </dl>

      @if (rule().requiresHumanReview) {
        <p class="rule-review">
          <strong>Revisão humana necessária</strong> para esta regra.
        </p>
      }
    </article>
  `,
  styles: `
    .rule-card {
      padding: 1.25rem;
      border: 1px solid #cbd5e1;
      border-radius: 0.75rem;
      background: #fff;
      overflow-wrap: anywhere;
    }

    header {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      align-items: center;
    }

    h3 {
      flex-basis: 100%;
      margin: 0.25rem 0;
    }

    h4 {
      margin-bottom: 0.5rem;
    }

    .rule-id,
    .rule-type {
      padding: 0.2rem 0.5rem;
      border-radius: 999px;
      font-weight: 600;
    }

    .rule-id {
      background: #e2e8f0;
    }

    .rule-type {
      background: #dbeafe;
      color: #1e3a8a;
    }

    blockquote {
      margin: 0;
      padding: 0.75rem 1rem;
      border-left: 0.25rem solid #2563eb;
      background: #eff6ff;
    }

    dl {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
      gap: 0.75rem;
    }

    dl div {
      min-width: 0;
    }

    dt {
      font-size: 0.875rem;
      font-weight: 700;
      color: #475569;
    }

    dd {
      margin: 0.2rem 0 0;
    }

    [data-missing="true"] {
      color: #64748b;
      font-style: italic;
    }

    .rule-review {
      padding: 0.75rem;
      background: #fff7ed;
      color: #7c2d12;
    }
  `,
})
export class RuleCardComponent {
  readonly rule = input.required<ExtractedRule>();

  typeLabel(type: RuleType): string {
    return RULE_TYPE_LABELS[type];
  }

  confidenceLabel(confidence: Confidence): string {
    return CONFIDENCE_LABELS[confidence];
  }

  valueOrMissing(value: string | null): string {
    return value ?? "Não identificado";
  }
}
