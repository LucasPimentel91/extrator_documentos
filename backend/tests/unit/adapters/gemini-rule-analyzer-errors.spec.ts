import { describe, expect, it } from "vitest";

import { GeminiRuleAnalyzer, type GeminiTransport } from "../../../src/adapters/gemini-rule-analyzer.js";

describe("GeminiRuleAnalyzer errors", () => {
  it("repairs invalid JSON once", async () => {
    let calls = 0;
    const transport: GeminiTransport = {
      generate: async () => (++calls === 1 ? "invalid" : '{"rules":[]}'),
    };
    await new GeminiRuleAnalyzer(transport).analyze({
      text: "texto",
      signal: new AbortController().signal,
    });
    expect(calls).toBe(2);
  });
  it("rejects a second invalid response", async () => {
    const transport: GeminiTransport = { generate: async () => "invalid" };
    await expect(
      new GeminiRuleAnalyzer(transport).analyze({
        text: "texto",
        signal: new AbortController().signal,
      }),
    ).rejects.toMatchObject({ code: "AI_INVALID_RESPONSE" });
  });
  it("maps provider failure", async () => {
    const transport: GeminiTransport = {
      generate: async () => {
        throw new Error("offline");
      },
    };
    await expect(
      new GeminiRuleAnalyzer(transport).analyze({
        text: "texto",
        signal: new AbortController().signal,
      }),
    ).rejects.toMatchObject({ code: "AI_UNAVAILABLE" });
  });
  it("aborts and maps timeout", async () => {
    const transport: GeminiTransport = {
      generate: (_prompt, signal) =>
        new Promise((_resolve, reject) => {
          signal.addEventListener("abort", () => reject(new Error("aborted")));
        }),
    };
    await expect(
      new GeminiRuleAnalyzer(transport, 1).analyze({
        text: "texto",
        signal: new AbortController().signal,
      }),
    ).rejects.toMatchObject({ code: "AI_TIMEOUT" });
  });
});
