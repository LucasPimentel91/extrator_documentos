import { describe, expect, it } from "vitest";

import { GeminiRuleAnalyzer, type GeminiTransport } from "../../../src/adapters/gemini-rule-analyzer.js";

const empty = JSON.stringify({ rules: [] });
describe("GeminiRuleAnalyzer", () => {
  it("accepts structured output and no-rule documents", async () => {
    const transport: GeminiTransport = { generate: async () => empty };
    await expect(
      new GeminiRuleAnalyzer(transport).analyze({
        text: "Documento informativo.",
        signal: new AbortController().signal,
      }),
    ).resolves.toEqual({ rules: [] });
  });

  it("normalizes provider metadata before validation", async () => {
    const transport: GeminiTransport = {
      generate: async () =>
        JSON.stringify({
          rules: [
            {
              id: "1",
              title: "Prazo para requerimento",
              description: "O aluno deve apresentar requerimento em ate 5 dias.",
              type: "obligation",
              evidence: "O aluno deve apresentar requerimento em ate 5 dias",
              location: { page: null, section: "" },
              subject: "aluno",
              action: "apresentar requerimento",
              deadline: "ate 5 dias",
              condition: "",
              exception: "",
              confidence: "high",
              requiresHumanReview: false,
            },
          ],
        }),
    };

    await expect(
      new GeminiRuleAnalyzer(transport).analyze({
        text: "Art. 1 O aluno deve apresentar requerimento em ate 5 dias.",
        signal: new AbortController().signal,
      }),
    ).resolves.toMatchObject({
      rules: [
        {
          id: "R001",
          condition: null,
          exception: null,
          location: { section: null },
        },
      ],
    });
  });
});
