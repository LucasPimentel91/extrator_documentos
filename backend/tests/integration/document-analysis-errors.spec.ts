import request from "supertest";
import { describe, expect, it } from "vitest";

import { createApp } from "../../src/app.js";
import { AppError } from "../../src/errors/app-error.js";
import { FakeRuleAnalyzer } from "../fakes/fake-rule-analyzer.js";

describe("document analysis errors", () => {
  it("maps unreadable text", async () => {
    const response = await request(createApp({ analyzer: new FakeRuleAnalyzer() }))
      .post("/api/documents/analyze")
      .attach("file", Buffer.from([0xc3, 0x28]), {
        filename: "bad.txt", contentType: "text/plain",
      });
    expect(response.status).toBe(422);
    expect(response.body.error.code).toBe("DOCUMENT_UNREADABLE");
  });
  it.each([
    ["AI_INVALID_RESPONSE", 502],
    ["AI_UNAVAILABLE", 503],
    ["AI_TIMEOUT", 504],
  ] as const)("maps %s", async (code, status) => {
    const analyzer = new FakeRuleAnalyzer(
      { rules: [] },
      new AppError(code, status, "Falha temporária."),
    );
    const response = await request(createApp({ analyzer }))
      .post("/api/documents/analyze")
      .attach("file", Buffer.from("Texto."), {
        filename: "a.txt", contentType: "text/plain",
      });
    expect(response.status).toBe(status);
    expect(response.body.error.code).toBe(code);
  });
});
