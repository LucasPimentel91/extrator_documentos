import { rateLimit } from "express-rate-limit";

import { AppError } from "../errors/app-error.js";

export function createRateLimitMiddleware(windowMs: number, limit: number) {
  return rateLimit({
    windowMs,
    limit,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    handler(_request, _response, next) {
      next(
        new AppError(
          "RATE_LIMITED",
          429,
          "Muitas solicitações. Tente novamente mais tarde.",
        ),
      );
    },
  });
}
