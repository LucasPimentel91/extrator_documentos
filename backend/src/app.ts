import express, { type Express } from "express";

import { parseEnvironment } from "./config/env.js";
import { AppError } from "./errors/app-error.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import { createRateLimitMiddleware } from "./middlewares/rate-limit.middleware.js";
import { requestIdMiddleware } from "./middlewares/request-id.middleware.js";
import { securityMiddleware } from "./middlewares/security.middleware.js";

export interface AppOptions {
  frontendOrigin?: string;
  rateLimitWindowMs?: number;
  rateLimitMax?: number;
}

export function createApp(options: AppOptions = {}): Express {
  const environment = parseEnvironment();
  const app = express();

  app.disable("x-powered-by");
  app.use(requestIdMiddleware);
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

  app.use(() => {
    throw new AppError("INTERNAL_ERROR", 404, "Recurso não encontrado.");
  });
  app.use(errorMiddleware);

  return app;
}
