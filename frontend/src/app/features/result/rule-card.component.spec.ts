import { TestBed } from "@angular/core/testing";

import type { ExtractedRule } from "../../../../../contracts/analysis";
import { RuleCardComponent } from "./rule-card.component";

const completeRule: ExtractedRule = {
  id: "R001",
  title: "Entrega do relatório",
  description: "A unidade deve entregar o relatório mensal.",
  type: "obligation",
  evidence: "A unidade deverá entregar o relatório até o quinto dia útil.",
  location: { page: 4, section: "Art. 7º" },
  subject: "Unidade responsável",
  action: "Entregar o relatório",
  deadline: "Até o quinto dia útil",
  condition: "Durante a vigência da norma",
  exception: "Salvo indisponibilidade comprovada",
  confidence: "high",
  requiresHumanReview: false,
};

describe("RuleCardComponent", () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RuleCardComponent],
    }).compileComponents();
  });

  it("renders every contract field, evidence, type and confidence", () => {
    const fixture = TestBed.createComponent(RuleCardComponent);
    fixture.componentRef.setInput("rule", completeRule);
    fixture.detectChanges();

    const card = fixture.nativeElement as HTMLElement;
    for (const expected of [
      "R001",
      "Entrega do relatório",
      "A unidade deve entregar o relatório mensal.",
      "Obrigação",
      completeRule.evidence,
      "Página 4",
      "Art. 7º",
      "Unidade responsável",
      "Entregar o relatório",
      "Até o quinto dia útil",
      "Durante a vigência da norma",
      "Salvo indisponibilidade comprovada",
      "Alta",
    ]) {
      expect(card.textContent).toContain(expected);
    }
    expect(card.querySelector("blockquote")).not.toBeNull();
    expect(card.querySelector("article")?.getAttribute("aria-labelledby")).toBe(
      "rule-R001-title",
    );
  });

  it("marks every absent optional value without inventing content", () => {
    const fixture = TestBed.createComponent(RuleCardComponent);
    fixture.componentRef.setInput("rule", {
      ...completeRule,
      id: "R002",
      location: { page: null, section: null },
      subject: null,
      action: null,
      deadline: null,
      condition: null,
      exception: null,
      confidence: "low",
      requiresHumanReview: true,
    });
    fixture.detectChanges();

    const card = fixture.nativeElement as HTMLElement;
    expect(card.querySelectorAll("[data-missing='true']")).toHaveLength(7);
    expect(card.textContent).toContain("Baixa");
    expect(card.textContent).toContain("Revisão humana necessária");
  });

  it.each([
    ["prohibition", "Proibição"],
    ["permission", "Permissão"],
    ["deadline", "Prazo"],
    ["condition", "Condição"],
    ["exception", "Exceção"],
    ["procedure", "Procedimento"],
    ["definition", "Definição normativa"],
    ["penalty", "Penalidade"],
  ] as const)("labels the %s rule type", (type, label) => {
    const fixture = TestBed.createComponent(RuleCardComponent);
    fixture.componentRef.setInput("rule", { ...completeRule, type });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain(label);
  });
});
