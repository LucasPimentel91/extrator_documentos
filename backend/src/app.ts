import express, { type Express } from "express";

import { parseEnvironment } from "./config/env.js";
import {
  GeminiRuleAnalyzer,
  OfficialGeminiTransport,
} from "./adapters/gemini-rule-analyzer.js";
import type { RuleAnalyzer } from "./adapters/rule-analyzer.js";
import { AppError } from "./errors/app-error.js";
import { logger } from "./logging/logger.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import { createRateLimitMiddleware } from "./middlewares/rate-limit.middleware.js";
import { requestIdMiddleware } from "./middlewares/request-id.middleware.js";
import { securityMiddleware } from "./middlewares/security.middleware.js";
import { createDocumentRouter } from "./routes/document.routes.js";
import { DocumentAnalysisService } from "./services/document-analysis.service.js";
import { TextExtractionService } from "./services/text-extraction.service.js";

export interface AppOptions {
  frontendOrigin?: string;
  rateLimitWindowMs?: number;
  rateLimitMax?: number;
  maxFileSizeBytes?: number;
  analyzer?: RuleAnalyzer;
}

export function createApp(options: AppOptions = {}): Express {
  const environment = parseEnvironment();
  const app = express();

  app.disable("x-powered-by");
  app.use(requestIdMiddleware);
  app.use((_request, response, next) => {
    const startedAt = Date.now();
    response.on("finish", () => {
      logger.info("request_completed", {
        requestId: response.locals.requestId,
        status: response.statusCode,
        durationMs: Date.now() - startedAt,
      });
    });
    next();
  });
  app.use(
    ...securityMiddleware(
      options.frontendOrigin ?? environment.FRONTEND_ORIGIN,
    ),
  );
  app.use(
    createRateLimitMiddleware(
      options.rateLimitWindowMs ?? environment.RATE_LIMIT_WINDOW_MS,
      options.rateLimitMax ?? environment.RATE_LIMIT_MAX,
    ),
  );
  app.use(express.json({ limit: "16kb" }));

  app.get("/health", (_request, response) => {
    response.status(200).json({ status: "ok" });
  });

  const analyzer =
    options.analyzer ??
    (environment.GEMINI_API_KEY
      ? new GeminiRuleAnalyzer(
          new OfficialGeminiTransport(
            environment.GEMINI_API_KEY,
            environment.GEMINI_MODEL,
          ),
          environment.GEMINI_TIMEOUT_MS,
        )
      : {
          analyze: async () => {
            throw new AppError(
              "AI_UNAVAILABLE",
              503,
              "Configure a integração de análise no servidor.",
            );
          },
        });
  const documentService = new DocumentAnalysisService(
    new TextExtractionService(),
    analyzer,
  );
  app.use(
    "/api",
    createDocumentRouter(
      documentService,
      options.maxFileSizeBytes ?? environment.MAX_FILE_SIZE_BYTES,
    ),
  );

  app.use(() => {
    throw new AppError("INTERNAL_ERROR", 404, "Recurso não encontrado.");
  });
  app.use(errorMiddleware);

  return app;
}
