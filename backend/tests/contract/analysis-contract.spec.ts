import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import {
  ANALYSIS_ERROR_CODES,
  RULE_TYPES,
  type AnalysisErrorResponse,
  type AnalysisResult,
} from "../../../contracts/analysis.js";
import {
  analysisErrorResponseSchema,
  analysisResultSchema,
} from "../../src/schemas/analysis.schema.js";

const require = createRequire(import.meta.url);
const { load } = require("js-yaml") as {
  load(source: string): unknown;
};

interface OpenApiDocument {
  paths: {
    "/documents/analyze": {
      post: {
        responses: Record<
          string,
          {
            content?: {
              "application/json"?: {
                examples?: Record<string, { value: unknown }>;
              };
            };
          }
        >;
      };
    };
  };
  components: {
    schemas: {
      Rule: { properties: { type: { enum: string[] } } };
      ErrorResponse: {
        properties: {
          error: { properties: { code: { enum: string[] } } };
        };
      };
    };
  };
}

const contract = load(
  readFileSync(
    resolve(process.cwd(), "../specs/001-analisar-regras/contracts/openapi.yaml"),
    "utf8",
  ),
) as OpenApiDocument;

describe("analysis contract compatibility", () => {
  it("keeps OpenAPI enums synchronized with TypeScript", () => {
    expect(contract.components.schemas.Rule.properties.type.enum).toEqual([
      ...RULE_TYPES,
    ]);
    expect(
      contract.components.schemas.ErrorResponse.properties.error.properties
        .code.enum,
    ).toEqual([...ANALYSIS_ERROR_CODES]);
  });

  it("validates the OpenAPI success example with Zod and TypeScript", () => {
    const example = contract.paths["/documents/analyze"].post.responses[
      "200"
    ]?.content?.["application/json"]?.examples?.["withRules"]?.value;
    const parsed = analysisResultSchema.parse(example);
    const typed: AnalysisResult = parsed;
    expect(typed.summary.totalRules).toBe(1);
  });

  it("validates every OpenAPI error example with Zod and TypeScript", () => {
    const responses =
      contract.paths["/documents/analyze"].post.responses;
    for (const status of ["400", "413", "422", "429", "502", "503", "504", "500"]) {
      const examples =
        responses[status]?.content?.["application/json"]?.examples;
      const example = examples
        ? Object.values(examples)[0]?.value
        : undefined;
      const parsed = analysisErrorResponseSchema.parse(example);
      const typed: AnalysisErrorResponse = parsed;
      expect(ANALYSIS_ERROR_CODES).toContain(typed.error.code);
    }
  });
});
