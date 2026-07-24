import { z } from "zod";

const ruleTypeSchema = z.enum([
  "obligation",
  "prohibition",
  "permission",
  "deadline",
  "condition",
  "exception",
  "procedure",
  "definition",
  "penalty",
]);

const nullableTextSchema = z.string().trim().min(1).nullable();

export const ruleSchema = z.strictObject({
  id: z.string().regex(/^R[0-9]{3,}$/),
  title: z.string().trim().min(1),
  description: z.string().trim().min(1),
  type: ruleTypeSchema,
  evidence: z.string().trim().min(1),
  location: z.strictObject({
    page: z.number().int().positive().nullable(),
    section: nullableTextSchema,
  }),
  subject: nullableTextSchema,
  action: nullableTextSchema,
  deadline: nullableTextSchema,
  condition: nullableTextSchema,
  exception: nullableTextSchema,
  confidence: z.enum(["high", "medium", "low"]),
  requiresHumanReview: z.boolean(),
});

export const analyzerOutputSchema = z.strictObject({
  rules: z.array(ruleSchema),
});

export const analysisResultSchema = z
  .strictObject({
    document: z.strictObject({
      name: z.string().trim().min(1),
      type: z.string().trim().min(1),
      characters: z.number().int().nonnegative(),
    }),
    summary: z.strictObject({
      totalRules: z.number().int().nonnegative(),
      requiresHumanReview: z.boolean(),
    }),
    rules: z.array(ruleSchema),
  })
  .superRefine((result, context) => {
    if (result.summary.totalRules !== result.rules.length) {
      context.addIssue({
        code: "custom",
        message: "summary.totalRules must equal rules.length",
        path: ["summary", "totalRules"],
      });
    }

    const ids = new Set(result.rules.map((rule) => rule.id));
    if (ids.size !== result.rules.length) {
      context.addIssue({
        code: "custom",
        message: "rule ids must be unique",
        path: ["rules"],
      });
    }

    const reviewRequired =
      result.rules.length === 0 ||
      result.rules.some((rule) => rule.requiresHumanReview);
    if (reviewRequired && !result.summary.requiresHumanReview) {
      context.addIssue({
        code: "custom",
        message: "summary must require human review",
        path: ["summary", "requiresHumanReview"],
      });
    }
  });

export const analysisErrorResponseSchema = z.strictObject({
  error: z.strictObject({
    code: z.enum([
      "FILE_REQUIRED",
      "INVALID_FILE_TYPE",
      "FILE_TOO_LARGE",
      "EMPTY_FILE",
      "DOCUMENT_UNREADABLE",
      "RATE_LIMITED",
      "AI_INVALID_RESPONSE",
      "AI_UNAVAILABLE",
      "AI_TIMEOUT",
      "INTERNAL_ERROR",
    ]),
    message: z.string().trim().min(1),
    requestId: z.string().trim().min(1),
  }),
});

export type AnalysisResult = z.infer<typeof analysisResultSchema>;
