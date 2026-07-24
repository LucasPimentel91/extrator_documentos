import type { ErrorRequestHandler } from "express";

import { AppError } from "../errors/app-error.js";
import { logger } from "../logging/logger.js";

export const errorMiddleware: ErrorRequestHandler = (
  error: unknown,
  _request,
  response,
  _next,
) => {
  const requestId =
    typeof response.locals.requestId === "string"
      ? response.locals.requestId
      : "unavailable";

  if (error instanceof AppError) {
    logger.error("request_failed", {
      requestId,
      status: error.status,
      errorCode: error.code,
    });
    response.status(error.status).json({
      error: {
        code: error.code,
        message: error.publicMessage,
        requestId,
      },
    });
    return;
  }

  logger.error("request_failed", {
    requestId,
    status: 500,
    errorCode: "INTERNAL_ERROR",
    errorName: error instanceof Error ? error.name : "UnknownError",
  });
  response.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      message: "Ocorreu um erro interno.",
      requestId,
    },
  });
};
