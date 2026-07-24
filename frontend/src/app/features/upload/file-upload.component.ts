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
