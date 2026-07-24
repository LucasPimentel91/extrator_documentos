import { describe, expect, it } from "vitest";

import { TxtExtractor } from "../../../src/services/extractors/txt.extractor.js";

describe("TxtExtractor", () => {
  const extractor = new TxtExtractor();
  it("decodes UTF-8, BOM and normalizes newlines", async () => {
    await expect(
      extractor.extract(Buffer.from("\uFEFFRegra\r\nválida")),
    ).resolves.toEqual({ text: "Regra\nválida" });
  });
  it.each([Buffer.from([0, 1]), Buffer.from("   ")])(
    "rejects binary or empty content",
    async (buffer) => {
      await expect(extractor.extract(buffer)).rejects.toThrow(
        "DOCUMENT_UNREADABLE",
      );
    },
  );
});
