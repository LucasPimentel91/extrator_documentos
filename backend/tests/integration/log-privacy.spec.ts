import request from "supertest";
import { afterEach, describe, expect, it, vi } from "vitest";

import { createApp } from "../../src/app.js";
import { AppError } from "../../src/errors/app-error.js";
import { FakeRuleAnalyzer } from "../fakes/fake-rule-analyzer.js";

const uniqueDocumentPhrase = "PHRASE_DOCUMENTAIRE_UNIQUE_7F3A";
const fakeApiKey = "FAKE_KEY_MUST_NOT_APPEAR";

describe("log privacy regression", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("never logs document content or secrets on success and failure", async () => {
    const writes: string[] = [];
    vi.spyOn(process.stdout, "write").mockImplementation((chunk) => {
      writes.push(String(chunk));
      return true;
    });

    await request(createApp({ analyzer: new FakeRuleAnalyzer() }))
      .post("/api/documents/analyze")
      .attach("file", Buffer.from(uniqueDocumentPhrase), {
        filename: "success.txt",
        contentType: "text/plain",
      });
    await request(
      createApp({
        analyzer: new FakeRuleAnalyzer(
          { rules: [] },
          new AppError("AI_UNAVAILABLE", 503, fakeApiKey),
        ),
      }),
    )
      .post("/api/documents/analyze")
      .attach("file", Buffer.from(uniqueDocumentPhrase), {
        filename: "failure.txt",
        contentType: "text/plain",
      });

    const logs = writes.join("");
    expect(logs).not.toContain(uniqueDocumentPhrase);
    expect(logs).not.toContain(fakeApiKey);
    expect(logs).not.toContain("success.txt");
    expect(logs).not.toContain("failure.txt");
    expect(logs).toContain("requestId");
    expect(logs).toContain("AI_UNAVAILABLE");
  });
});
