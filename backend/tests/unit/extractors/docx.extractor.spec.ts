import { beforeEach, describe, expect, it, vi } from "vitest";

const { extractRawText } = vi.hoisted(() => ({ extractRawText: vi.fn() }));
vi.mock("mammoth", () => ({ default: { extractRawText } }));

import { DocxExtractor } from "../../../src/services/extractors/docx.extractor.js";

describe("DocxExtractor", () => {
  beforeEach(() => extractRawText.mockReset());
  it("extracts raw text only", async () => {
    extractRawText.mockResolvedValue({ value: "Regra válida", messages: [] });
    await expect(new DocxExtractor().extract(Buffer.from("PK"))).resolves.toEqual({
      text: "Regra válida",
    });
  });
  it("rejects corrupt and empty documents", async () => {
    extractRawText.mockResolvedValue({ value: "   ", messages: [] });
    await expect(new DocxExtractor().extract(Buffer.from("bad"))).rejects.toThrow(
      "DOCUMENT_UNREADABLE",
    );
  });
});
