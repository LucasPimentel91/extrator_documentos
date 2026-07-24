import { provideHttpClient } from "@angular/common/http";
import { TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";

import { AnalysisApiError } from "../../core/interceptors/api-error.interceptor";
import { UploadPageComponent } from "./upload-page.component";

describe("UploadPageComponent recovery states", () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UploadPageComponent],
      providers: [provideHttpClient(), provideRouter([])],
    }).compileComponents();
  });

  it.each([
    [
      new File(["x"], "programa.exe", {
        type: "application/octet-stream",
      }),
      "Formato inválido",
    ],
    [
      new File([new Uint8Array(10_485_761)], "grande.txt", {
        type: "text/plain",
      }),
      "excede o limite",
    ],
  ])("shows a specific client validation error", (file, expected) => {
    const fixture = TestBed.createComponent(UploadPageComponent);
    fixture.componentInstance.selectFile(file);
    fixture.detectChanges();

    const alert = fixture.nativeElement.querySelector("[role='alert']");
    expect(alert.textContent).toContain(expected);
    expect(fixture.componentInstance.file.value).toBeNull();
  });

  it("distinguishes a reading failure and offers another selection", () => {
    const fixture = TestBed.createComponent(UploadPageComponent);
    fixture.componentInstance.store.setError(
      new AnalysisApiError(
        "DOCUMENT_UNREADABLE",
        "req-read",
        "mensagem externa",
      ),
    );
    fixture.detectChanges();

    const recovery = fixture.nativeElement.querySelector(
      "[data-testid='processing-error']",
    );
    expect(recovery.textContent).toContain("Não foi possível ler o documento");
    expect(recovery.textContent).toContain("Ocorrência: req-read");
    expect(recovery.querySelector("[data-action='select-another']")).not.toBeNull();
    expect(recovery.querySelector("[data-action='retry']")).toBeNull();
  });

  it.each([
    ["AI_UNAVAILABLE", "temporariamente indisponível"],
    ["AI_INVALID_RESPONSE", "resposta inválida"],
    ["AI_TIMEOUT", "tempo limite"],
  ] as const)("shows retry for %s", (code, expected) => {
    const fixture = TestBed.createComponent(UploadPageComponent);
    fixture.componentInstance.selectFile(
      new File(["regra"], "norma.txt", { type: "text/plain" }),
    );
    fixture.componentInstance.store.setError(
      new AnalysisApiError(code, `req-${code}`, "mensagem externa"),
    );
    fixture.detectChanges();

    const recovery = fixture.nativeElement.querySelector(
      "[data-testid='processing-error']",
    );
    expect(recovery.textContent).toContain(expected);
    expect(recovery.textContent).toContain(`req-${code}`);
    expect(recovery.querySelector("[data-action='retry']")).not.toBeNull();
  });
});
