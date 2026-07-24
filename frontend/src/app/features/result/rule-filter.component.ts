import { Component, input, output } from "@angular/core";

import {
  RULE_TYPES,
  type RuleType,
} from "../../../../../contracts/analysis";
import type { RuleFilter } from "../../core/state/analysis.store";

interface FilterOption {
  value: RuleFilter;
  label: string;
}

const TYPE_LABELS: Record<RuleType, string> = {
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

@Component({
  selector: "app-rule-filter",
  standalone: true,
  template: `
    <div class="filter">
      <label for="rule-type-filter">Filtrar por categoria</label>
      <select
        id="rule-type-filter"
        [value]="selected()"
        (change)="selectFilter($event)"
      >
        @for (option of options; track option.value) {
          <option [value]="option.value">{{ option.label }}</option>
        }
      </select>
    </div>
  `,
  styles: `
    .filter {
      display: grid;
      gap: 0.375rem;
      max-width: 22rem;
    }

    label {
      font-weight: 700;
    }

    select {
      width: 100%;
      min-height: 2.75rem;
      padding: 0.5rem;
      border: 1px solid #64748b;
      border-radius: 0.375rem;
      background: #fff;
      color: #0f172a;
      font: inherit;
    }

    select:focus-visible {
      outline: 0.2rem solid #2563eb;
      outline-offset: 0.15rem;
    }
  `,
})
export class RuleFilterComponent {
  readonly selected = input.required<RuleFilter>();
  readonly filterChange = output<RuleFilter>();
  readonly options: readonly FilterOption[] = [
    { value: "all", label: "Todos os tipos" },
    ...RULE_TYPES.map((value) => ({ value, label: TYPE_LABELS[value] })),
  ];

  selectFilter(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    if (value === "all" || RULE_TYPES.includes(value as RuleType)) {
      this.filterChange.emit(value as RuleFilter);
    }
  }
}
