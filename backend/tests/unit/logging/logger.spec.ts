import { describe, expect, it } from "vitest";

import { createLogger } from "../../../src/logging/logger.js";

describe("createLogger", () => {
  it("emits only allowlisted metadata", () => {
    const entries: string[] = [];
    const logger = createLogger((entry) => entries.push(entry));

    logger.info("analysis_completed", {
      requestId: "req-1",
      status: 200,
      bytes: 128,
      documentText: "UNIQUE_DOCUMENT_SECRET",
      evidence: "SECRET_EVIDENCE",
      prompt: "SECRET_PROMPT",
      apiKey: "SECRET_API_KEY",
      rawResponse: "SECRET_RESPONSE",
    });

    const output = entries.join("");
    expect(output).toContain("req-1");
    expect(output).toContain('"bytes":128');
    expect(output).not.toContain("UNIQUE_DOCUMENT_SECRET");
    expect(output).not.toContain("SECRET_EVIDENCE");
    expect(output).not.toContain("SECRET_PROMPT");
    expect(output).not.toContain("SECRET_API_KEY");
    expect(output).not.toContain("SECRET_RESPONSE");
  });
});
