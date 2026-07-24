import { beforeEach, describe, expect, it, vi } from "vitest";

const getText = vi.fn();
const destroy = vi.fn();
vi.mock("pdf-parse", () => ({
  PDFParse: class {
    getText = getText;
    destroy = destroy;
  },
}));

import { PdfExtractor } from "../../../src/services/extractors/pdf.extractor.js";

describe("PdfExtractor", () => {
  beforeEach(() => {
    getText.mockReset();
    destroy.mockReset();
  });
  it("preserves page locations", async () => {
    getText.mockResolvedValue({
      text: "Primeira\nSegunda",
      pages: [{ text: "Primeira" }, { text: "Segunda" }],
    });
    await expect(new PdfExtractor().extract(Buffer.from("%PDF-"))).resolves.toEqual({
      text: "Primeira\nSegunda",
      pages: [
        { page: 1, text: "Primeira" },
        { page: 2, text: "Segunda" },
      ],
    });
    expect(destroy).toHaveBeenCalled();
  });
  it("rejects corrupt or textless PDFs", async () => {
    getText.mockRejectedValue(new Error("corrupt"));
    await expect(new PdfExtractor().extract(Buffer.from("bad"))).rejects.toThrow(
      "DOCUMENT_UNREADABLE",
    );
  });
});
