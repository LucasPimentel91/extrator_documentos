import { Component, inject } from "@angular/core";
import { FormControl, ReactiveFormsModule, Validators } from "@angular/forms";
import { Router } from "@angular/router";

import { AnalysisApiService } from "../../core/services/analysis-api.service";
import { AnalysisStore } from "../../core/state/analysis.store";
import { AnalysisProgressComponent } from "./analysis-progress.component";
import { FileUploadComponent } from "./file-upload.component";

const MAX_FILE_SIZE_BYTES = 10_485_760;
const ALLOWED_EXTENSIONS = [".pdf", ".docx", ".txt"];

@Component({
  selector: "app-upload-page",
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FileUploadComponent,
    AnalysisProgressComponent,
  ],
  template: `
    <main>
      <h1>Analisador de Regras Institucionais</h1>
      <form (ngSubmit)="analyze()">
        <app-file-upload
          [disabled]="isBusy"
          (fileSelected)="selectFile($event)"
        />
        @if (fileError) {
          <p role="alert">{{ fileError }}</p>
        }
        @if (file.value) {
          <p>Arquivo: {{ file.value.name }}</p>
        }
        <button type="submit" [disabled]="file.invalid || isBusy">
          Analisar documento
        </button>
      </form>
      <app-analysis-progress [status]="store.status()" />
      @if (store.error(); as error) {
        <p role="alert">{{ error.message }}</p>
      }
    </main>
  `,
})
export class UploadPageComponent {
  readonly store = inject(AnalysisStore);
  private readonly api = inject(AnalysisApiService);
  private readonly router = inject(Router);
  readonly file = new FormControl<File | null>(null, Validators.required);
  fileError: string | null = null;

  get isBusy(): boolean {
    return ["uploading", "analyzing"].includes(this.store.status());
  }

  selectFile(file: File): void {
    const extension = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      this.file.setValue(null);
      this.fileError = "Formato inválido. Use PDF, DOCX ou TXT.";
      return;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      this.file.setValue(null);
      this.fileError = "O arquivo excede o limite permitido.";
      return;
    }
    this.fileError = null;
    this.file.setValue(file);
    this.store.selectFile(file);
    this.store.setStatus("ready");
  }

  async analyze(): Promise<void> {
    const file = this.file.value;
    if (!file || this.isBusy) return;
    this.store.setStatus("uploading");
    try {
      this.store.setStatus("analyzing");
      const result = await this.api.analyze(file);
      this.store.setResult(result);
      await this.router.navigate(["/resultado"]);
    } catch (error) {
      if (error instanceof Error && "code" in error) {
        this.store.setError(
          error as Parameters<AnalysisStore["setError"]>[0],
        );
      }
    }
  }
}
