import request from "supertest";
import { describe, expect, it } from "vitest";

import type { ExtractedRule } from "../../../contracts/analysis.js";
import { createApp } from "../../src/app.js";
import { analysisResultSchema } from "../../src/schemas/analysis.schema.js";
import { FakeRuleAnalyzer } from "../fakes/fake-rule-analyzer.js";

const rule: ExtractedRule = {
  id: "R001", title: "Entrega", description: "Entregar relatório",
  type: "obligation", evidence: "deverá entregar o relatório",
  location: { page: null, section: null }, subject: "setor",
  action: "entregar", deadline: null, condition: null, exception: null,
  confidence: "high", requiresHumanReview: false,
};

describe("POST /api/documents/analyze", () => {
  it("returns the validated contract", async () => {
    const response = await request(
      createApp({ analyzer: new FakeRuleAnalyzer({ rules: [rule] }) }),
    ).post("/api/documents/analyze").attach(
      "file", Buffer.from("O setor deverá entregar o relatório."),
      { filename: "norma.txt", contentType: "text/plain" },
    );
    expect(response.status).toBe(200);
    expect(analysisResultSchema.safeParse(response.body).success).toBe(true);
    expect(response.body.summary.totalRules).toBe(1);
  });
  it("returns a reviewable no-rule result", async () => {
    const response = await request(createApp({ analyzer: new FakeRuleAnalyzer() }))
      .post("/api/documents/analyze")
      .attach("file", Buffer.from("Texto informativo."), {
        filename: "manual.txt", contentType: "text/plain",
      });
    expect(response.body).toMatchObject({
      summary: { totalRules: 0, requiresHumanReview: true },
      rules: [],
    });
  });
});
