import { TestBed } from "@angular/core/testing";

import { ResultSummaryComponent } from "./result-summary.component";

describe("ResultSummaryComponent", () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResultSummaryComponent],
    }).compileComponents();
  });

  it("shows the total and mandatory review state", () => {
    const fixture = TestBed.createComponent(ResultSummaryComponent);
    fixture.componentRef.setInput("summary", {
      totalRules: 3,
      requiresHumanReview: true,
    });
    fixture.detectChanges();

    const summary = fixture.nativeElement.querySelector("[data-testid='result-summary']");
    expect(summary.textContent).toContain("3 regras identificadas");
    expect(summary.textContent).toContain("Revisão humana necessária");
  });

  it("shows an explicit no-rules state", () => {
    const fixture = TestBed.createComponent(ResultSummaryComponent);
    fixture.componentRef.setInput("summary", {
      totalRules: 0,
      requiresHumanReview: true,
    });
    fixture.detectChanges();

    const status = fixture.nativeElement.querySelector("[role='status']");
    expect(status.textContent).toContain("Nenhuma regra encontrada");
    expect(status.textContent).toContain("revise o documento original");
  });
});
