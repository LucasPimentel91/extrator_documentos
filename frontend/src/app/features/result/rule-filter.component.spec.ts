import { TestBed } from "@angular/core/testing";

import { RULE_TYPES } from "../../../../../contracts/analysis";
import { RuleFilterComponent } from "./rule-filter.component";

describe("RuleFilterComponent", () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RuleFilterComponent],
    }).compileComponents();
  });

  it("labels the native control and offers all nine rule types", () => {
    const fixture = TestBed.createComponent(RuleFilterComponent);
    fixture.componentRef.setInput("selected", "all");
    fixture.detectChanges();

    const select = fixture.nativeElement.querySelector("select") as HTMLSelectElement;
    const label = fixture.nativeElement.querySelector("label") as HTMLLabelElement;
    expect(label.htmlFor).toBe(select.id);
    expect(label.textContent).toContain("Filtrar por categoria");
    expect([...select.options].map((option) => option.value)).toEqual([
      "all",
      ...RULE_TYPES,
    ]);
    expect([...select.options].map((option) => option.textContent)).toEqual([
      "Todos os tipos",
      "Obrigação",
      "Proibição",
      "Permissão",
      "Prazo",
      "Condição",
      "Exceção",
      "Procedimento",
      "Definição normativa",
      "Penalidade",
    ]);
  });

  it("is keyboard-focusable and emits the selected category", () => {
    const fixture = TestBed.createComponent(RuleFilterComponent);
    fixture.componentRef.setInput("selected", "all");
    fixture.detectChanges();
    const select = fixture.nativeElement.querySelector("select") as HTMLSelectElement;
    let emitted: string | undefined;
    fixture.componentInstance.filterChange.subscribe((value) => (emitted = value));

    select.focus();
    expect(document.activeElement).toBe(select);
    select.value = "procedure";
    select.dispatchEvent(new Event("change"));

    expect(emitted).toBe("procedure");
  });
});
