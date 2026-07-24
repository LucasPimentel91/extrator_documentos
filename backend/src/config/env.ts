import { z } from "zod";

const environmentSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().max(65_535).default(3000),
  FRONTEND_ORIGIN: z.url().default("http://localhost:4200"),
  GEMINI_API_KEY: z.string().min(1).optional(),
  GEMINI_MODEL: z.string().min(1).default("replace-with-supported-model"),
  GEMINI_TIMEOUT_MS: z.coerce.number().int().positive().default(120_000),
  MAX_FILE_SIZE_BYTES: z.coerce.number().int().positive().default(10_485_760),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60_000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(10),
});

export type Environment = z.infer<typeof environmentSchema>;

export function parseEnvironment(
  input: Record<string, string | undefined> = process.env,
): Environment {
  return environmentSchema.parse(input);
}
