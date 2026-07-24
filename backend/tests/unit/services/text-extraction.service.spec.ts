import { describe, expect, it } from "vitest";

import type { DocumentTextExtractor } from "../../../src/services/extractors/document-text-extractor.js";
import { TextExtractionService } from "../../../src/services/text-extraction.service.js";

describe("TextExtractionService", () => {
  it("selects an extractor and returns metadata", async () => {
    const extractor: DocumentTextExtractor = {
      extract: async () => ({ text: "Regra" }),
    };
    const service = new TextExtractionService({ "text/plain": extractor });
    await expect(
      service.extract({ name: "a.txt", type: "text/plain", buffer: Buffer.from("x") }),
    ).resolves.toMatchObject({ name: "a.txt", characters: 5, text: "Regra" });
  });
  it("rejects unknown and unreadable content", async () => {
    const service = new TextExtractionService({});
    await expect(
      service.extract({ name: "a.bin", type: "x/bin", buffer: Buffer.from("x") }),
    ).rejects.toMatchObject({ code: "INVALID_FILE_TYPE" });
  });
});
