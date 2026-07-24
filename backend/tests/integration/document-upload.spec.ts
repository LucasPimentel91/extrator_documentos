import request from "supertest";
import { describe, expect, it } from "vitest";

import { createApp } from "../../src/app.js";
import { FakeRuleAnalyzer } from "../fakes/fake-rule-analyzer.js";

describe("document upload", () => {
  it("requires a file", async () => {
    const response = await request(createApp({ analyzer: new FakeRuleAnalyzer() }))
      .post("/api/documents/analyze");
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("FILE_REQUIRED");
  });
  it("rejects extension and MIME mismatch", async () => {
    const response = await request(createApp({ analyzer: new FakeRuleAnalyzer() }))
      .post("/api/documents/analyze")
      .attach("file", Buffer.from("text"), {
        filename: "norma.pdf",
        contentType: "text/plain",
      });
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("INVALID_FILE_TYPE");
  });
  it("accepts exact limit and rejects one byte above", async () => {
    const app = createApp({ analyzer: new FakeRuleAnalyzer(), maxFileSizeBytes: 4 });
    expect(
      (await request(app).post("/api/documents/analyze").attach(
        "file", Buffer.from("text"), { filename: "a.txt", contentType: "text/plain" },
      )).status,
    ).toBe(200);
    const over = await request(app).post("/api/documents/analyze").attach(
      "file", Buffer.from("texts"), { filename: "a.txt", contentType: "text/plain" },
    );
    expect(over.status).toBe(413);
  });
});
