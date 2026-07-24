import { describe, expect, it } from "vitest";

import type { RuleAnalyzer } from "../../src/adapters/rule-analyzer.js";
import { DocumentAnalysisService } from "../../src/services/document-analysis.service.js";
import { TextExtractionService } from "../../src/services/text-extraction.service.js";

const sensitiveText = "conteúdo temporário identificável";

function createExtractor(): TextExtractionService {
  return new TextExtractionService({
    "text/plain": {
      async extract() {
        return { text: sensitiveText };
      },
    },
  });
}

describe("document temporary data disposal", () => {
  it("clears the upload buffer and analyzer text after success", async () => {
    let analyzerInput:
      | { text: string; signal: AbortSignal }
      | undefined;
    const analyzer: RuleAnalyzer = {
      async analyze(input) {
        analyzerInput = input;
        return { rules: [] };
      },
    };
    const service = new DocumentAnalysisService(createExtractor(), analyzer);
    const buffer = Buffer.from("arquivo temporário");

    await service.analyze(
      { name: "norma.txt", type: "text/plain", buffer },
      new AbortController().signal,
    );

    expect(buffer.every((byte) => byte === 0)).toBe(true);
    expect(analyzerInput?.text).toBe("");
  });

  it("clears temporary data when analysis fails", async () => {
    let analyzerInput:
      | { text: string; signal: AbortSignal }
      | undefined;
    const analyzer: RuleAnalyzer = {
      async analyze(input) {
        analyzerInput = input;
        throw new Error("falha controlada de teste");
      },
    };
    const service = new DocumentAnalysisService(createExtractor(), analyzer);
    const buffer = Buffer.from("arquivo temporário");

    await expect(
      service.analyze(
        { name: "norma.txt", type: "text/plain", buffer },
        new AbortController().signal,
      ),
    ).rejects.toThrow();

    expect(buffer.every((byte) => byte === 0)).toBe(true);
    expect(analyzerInput?.text).toBe("");
  });

  it("clears the upload buffer when extraction fails", async () => {
    const extractor = new TextExtractionService({
      "text/plain": {
        async extract() {
          throw new Error("ilegível");
        },
      },
    });
    const analyzer: RuleAnalyzer = {
      async analyze() {
        return { rules: [] };
      },
    };
    const service = new DocumentAnalysisService(extractor, analyzer);
    const buffer = Buffer.from("arquivo temporário");

    await expect(
      service.analyze(
        { name: "norma.txt", type: "text/plain", buffer },
        new AbortController().signal,
      ),
    ).rejects.toThrow();

    expect(buffer.every((byte) => byte === 0)).toBe(true);
  });
});
