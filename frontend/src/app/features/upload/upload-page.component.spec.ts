import { provideHttpClient } from "@angular/common/http";
import { TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";

import { UploadPageComponent } from "./upload-page.component";
import { FileUploadComponent } from "./file-upload.component";

describe("UploadPageComponent", () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UploadPageComponent],
      providers: [provideHttpClient(), provideRouter([])],
    }).compileComponents();
  });

  it("disables analysis when no file is selected", () => {
    const fixture = TestBed.createComponent(UploadPageComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector("button").disabled).toBe(true);
  });

  it("rejects unsupported files and accepts TXT", () => {
    const fixture = TestBed.createComponent(UploadPageComponent);
    fixture.componentInstance.selectFile(
      new File(["x"], "malware.exe", { type: "application/octet-stream" }),
    );
    expect(fixture.componentInstance.file.value).toBeNull();
    expect(fixture.componentInstance.fileError).toContain("Formato inválido");

    fixture.componentInstance.selectFile(
      new File(["regra"], "norma.txt", { type: "text/plain" }),
    );
    expect(fixture.componentInstance.file.value?.name).toBe("norma.txt");
  });

  it("rejects a file above the client limit", () => {
    const fixture = TestBed.createComponent(UploadPageComponent);
    fixture.componentInstance.selectFile(
      new File([new Uint8Array(10_485_761)], "grande.txt", {
        type: "text/plain",
      }),
    );
    expect(fixture.componentInstance.file.value).toBeNull();
    expect(fixture.componentInstance.fileError).toContain("excede");
  });

  it("ignores duplicate submission while busy", async () => {
    const fixture = TestBed.createComponent(UploadPageComponent);
    fixture.componentInstance.selectFile(new File(["x"], "a.txt"));
    fixture.componentInstance.store.setStatus("uploading");
    await fixture.componentInstance.analyze();
    expect(fixture.componentInstance.store.status()).toBe("uploading");
  });

  it("accepts a file emitted by drag-and-drop", () => {
    const fixture = TestBed.createComponent(FileUploadComponent);
    const file = new File(["x"], "a.txt");
    let emitted: File | undefined;
    fixture.componentInstance.fileSelected.subscribe((value) => (emitted = value));
    fixture.componentInstance.handleDrop({
      preventDefault() {},
      dataTransfer: { files: { item: () => file } },
    } as unknown as DragEvent);
    expect(emitted).toBe(file);
  });
});
