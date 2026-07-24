import { Component, EventEmitter, Input, Output } from "@angular/core";

@Component({
  selector: "app-file-upload",
  standalone: true,
  template: `
    <label
      class="drop-zone"
      (dragover)="allowDrop($event)"
      (drop)="handleDrop($event)"
    >
      <span>Selecione ou arraste um documento PDF, DOCX ou TXT</span>
      <input
        type="file"
        [disabled]="disabled"
        accept=".pdf,.docx,.txt"
        (change)="handleSelection($event)"
      />
    </label>
  `,
  styles: `
    .drop-zone {
      box-sizing: border-box;
      display: grid;
      gap: 0.75rem;
      width: 100%;
      padding: 1.25rem;
      border: 2px dashed #64748b;
      border-radius: 0.75rem;
      cursor: pointer;
    }

    .drop-zone:focus-within {
      outline: 0.2rem solid #2563eb;
      outline-offset: 0.2rem;
    }

    input {
      max-width: 100%;
      min-height: 2.75rem;
    }
  `,
})
export class FileUploadComponent {
  @Input() disabled = false;
  @Output() readonly fileSelected = new EventEmitter<File>();

  allowDrop(event: DragEvent): void {
    event.preventDefault();
  }

  handleDrop(event: DragEvent): void {
    event.preventDefault();
    const file = event.dataTransfer?.files.item(0);
    if (file) this.fileSelected.emit(file);
  }

  handleSelection(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.item(0);
    if (file) this.fileSelected.emit(file);
  }
}
