import { TestBed } from "@angular/core/testing";

import { AnalysisProgressComponent } from "./analysis-progress.component";

describe("AnalysisProgressComponent", () => {
  it.each([
    ["uploading", "Enviando documento"],
    ["analyzing", "Documento em análise"],
  ] as const)("announces %s", async (status, text) => {
    await TestBed.configureTestingModule({
      imports: [AnalysisProgressComponent],
    }).compileComponents();
    const fixture = TestBed.createComponent(AnalysisProgressComponent);
    fixture.componentRef.setInput("status", status);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="status"]').textContent)
      .toContain(text);
  });
});
