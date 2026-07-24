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
});
