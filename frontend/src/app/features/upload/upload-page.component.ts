import { Component, inject } from "@angular/core";
import { FormControl, ReactiveFormsModule, Validators } from "@angular/forms";
import { Router } from "@angular/router";

import type { AnalysisErrorCode } from "../../../../../contracts/analysis";
import { AnalysisApiError } from "../../core/interceptors/api-error.interceptor";
import { AnalysisApiService } from "../../core/services/analysis-api.service";
import { AnalysisStore } from "../../core/state/analysis.store";
import { AnalysisProgressComponent } from "./analysis-progress.component";
import { FileUploadComponent } from "./file-upload.component";

const MAX_FILE_SIZE_BYTES = 10_485_760;
const ALLOWED_EXTENSIONS = [".pdf", ".docx", ".txt"];

interface RecoveryMessage {
  message: string;
  retryable: boolean;
}

const RECOVERY_MESSAGES: Record<AnalysisErrorCode, RecoveryMessage> = {
  FILE_REQUIRED: {
    message: "Selecione um documento para iniciar a análise.",
    retryable: false,
  },
  INVALID_FILE_TYPE: {
    message: "O formato do arquivo não é permitido. Use PDF, DOCX ou TXT.",
    retryable: false,
  },
  FILE_TOO_LARGE: {
    message: "O arquivo excede o limite permitido.",
    retryable: false,
  },
  EMPTY_FILE: {
    message: "O arquivo está vazio. Selecione outro documento.",
    retryable: false,
  },
  DOCUMENT_UNREADABLE: {
    message:
      "Não foi possível ler o documento. Verifique o arquivo e selecione outro.",
    retryable: false,
  },
  RATE_LIMITED: {
    message: "Muitas tentativas foram realizadas. Aguarde e tente novamente.",
    retryable: true,
  },
  AI_INVALID_RESPONSE: {
    message:
      "O serviço retornou uma resposta inválida. Tente analisar novamente.",
    retryable: true,
  },
  AI_UNAVAILABLE: {
    message:
      "O serviço de análise está temporariamente indisponível. Tente novamente.",
    retryable: true,
  },
  AI_TIMEOUT: {
    message: "A análise excedeu o tempo limite. Tente novamente.",
    retryable: true,
  },
  INTERNAL_ERROR: {
    message: "Não foi possível concluir a análise. Tente novamente.",
    retryable: true,
  },
};

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
        <section
          class="processing-error"
          data-testid="processing-error"
          role="alert"
          aria-labelledby="processing-error-title"
        >
          <h2 id="processing-error-title">Não foi possível concluir a análise</h2>
          <p>{{ recoveryFor(error.code).message }}</p>
          @if (error.requestId) {
            <p class="request-id">Ocorrência: {{ error.requestId }}</p>
          }
          <div class="recovery-actions">
            @if (recoveryFor(error.code).retryable && store.selectedFile()) {
              <button
                type="button"
                data-action="retry"
                [disabled]="isBusy"
                (click)="retryAnalysis()"
              >
                Tentar novamente
              </button>
            }
            <button
              type="button"
              data-action="select-another"
              (click)="selectAnother()"
            >
              Selecionar outro arquivo
            </button>
          </div>
        </section>
      }
    </main>
  `,
  styles: `
    main {
      box-sizing: border-box;
      display: grid;
      gap: 1rem;
      width: min(100% - 2rem, 52rem);
      margin: 0 auto;
      padding: 2rem 0 4rem;
      overflow-wrap: anywhere;
    }

    form {
      display: grid;
      gap: 1rem;
    }

    button {
      min-height: 2.75rem;
      padding: 0.625rem 1rem;
    }

    button:focus-visible {
      outline: 0.2rem solid #2563eb;
      outline-offset: 0.15rem;
    }

    .processing-error {
      margin-top: 1rem;
      padding: 1rem;
      border: 2px solid #b91c1c;
      border-radius: 0.5rem;
      background: #fef2f2;
      color: #450a0a;
    }

    .processing-error h2 {
      margin-top: 0;
      font-size: 1.1rem;
    }

    .request-id {
      font-family: monospace;
      overflow-wrap: anywhere;
    }

    .recovery-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
    }

    .recovery-actions button {
      min-height: 2.75rem;
    }

    @media (max-width: 30rem) {
      main {
        width: min(100% - 1rem, 52rem);
        padding-top: 1rem;
      }
    }
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
      this.store.clearSelection();
      return;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      this.file.setValue(null);
      this.fileError = "O arquivo excede o limite permitido.";
      this.store.clearSelection();
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
      this.store.setError(
        error instanceof AnalysisApiError
          ? error
          : new AnalysisApiError(
              "INTERNAL_ERROR",
              null,
              "Não foi possível concluir a solicitação.",
            ),
      );
    }
  }

  recoveryFor(code: AnalysisErrorCode): RecoveryMessage {
    return RECOVERY_MESSAGES[code];
  }

  async retryAnalysis(): Promise<void> {
    if (!this.store.prepareRetry()) return;
    this.file.setValue(this.store.selectedFile());
    await this.analyze();
  }

  async selectAnother(): Promise<void> {
    this.file.reset();
    this.fileError = null;
    await this.store.reset();
  }
}
