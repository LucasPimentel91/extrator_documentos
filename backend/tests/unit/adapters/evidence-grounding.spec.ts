import { describe, expect, it } from "vitest";

import { GeminiRuleAnalyzer, type GeminiTransport } from "../../../src/adapters/gemini-rule-analyzer.js";

describe("evidence grounding", () => {
  it("rejects evidence absent from the document", async () => {
    const transport: GeminiTransport = {
      generate: async () =>
        JSON.stringify({
          rules: [{
            id: "R001", title: "Regra", description: "Descrição",
            type: "obligation", evidence: "texto inventado",
            location: { page: null, section: null }, subject: null, action: null,
            deadline: null, condition: null, exception: null, confidence: "low",
            requiresHumanReview: true,
          }],
        }),
    };
    await expect(
      new GeminiRuleAnalyzer(transport).analyze({
        text: "O setor deve entregar o relatório.",
        signal: new AbortController().signal,
      }),
    ).rejects.toMatchObject({ code: "AI_INVALID_RESPONSE" });
  });
});
