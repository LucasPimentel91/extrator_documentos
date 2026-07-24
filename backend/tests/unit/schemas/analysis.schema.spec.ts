import { describe, expect, it } from "vitest";

import {
  analysisErrorResponseSchema,
  analysisResultSchema,
} from "../../../src/schemas/analysis.schema.js";

const validRule = {
  id: "R001",
  title: "Entrega obrigatória",
  description: "O setor deve entregar o relatório.",
  type: "obligation",
  evidence: "O setor deverá entregar o relatório.",
  location: { page: 1, section: null },
  subject: "setor",
  action: "entregar o relatório",
  deadline: null,
  condition: null,
  exception: null,
  confidence: "high",
  requiresHumanReview: false,
} as const;

function validResult() {
  return {
    document: { name: "norma.txt", type: "text/plain", characters: 42 },
    summary: { totalRules: 1, requiresHumanReview: false },
    rules: [validRule],
  };
}

describe("analysisResultSchema", () => {
  it("accepts the complete contract with nullable fields", () => {
    expect(analysisResultSchema.safeParse(validResult()).success).toBe(true);
  });

  it.each([
    ["invalid enum", { ...validRule, type: "suggestion" }],
    ["empty evidence", { ...validRule, evidence: "" }],
    ["invalid id", { ...validRule, id: "1" }],
  ])("rejects %s", (_label, rule) => {
    expect(
      analysisResultSchema.safeParse({ ...validResult(), rules: [rule] })
        .success,
    ).toBe(false);
  });

  it("rejects a total inconsistent with rules", () => {
    expect(
      analysisResultSchema.safeParse({
        ...validResult(),
        summary: { totalRules: 2, requiresHumanReview: false },
      }).success,
    ).toBe(false);
  });

  it("rejects duplicated rule ids", () => {
    expect(
      analysisResultSchema.safeParse({
        ...validResult(),
        summary: { totalRules: 2, requiresHumanReview: false },
        rules: [validRule, validRule],
      }).success,
    ).toBe(false);
  });

  it("requires human review when no rules are found", () => {
    expect(
      analysisResultSchema.safeParse({
        ...validResult(),
        summary: { totalRules: 0, requiresHumanReview: false },
        rules: [],
      }).success,
    ).toBe(false);
  });
});

describe("analysisErrorResponseSchema", () => {
  it("accepts a stable public error", () => {
    expect(
      analysisErrorResponseSchema.safeParse({
        error: {
          code: "AI_TIMEOUT",
          message: "Tempo excedido.",
          requestId: "request-id",
        },
      }).success,
    ).toBe(true);
  });
});
