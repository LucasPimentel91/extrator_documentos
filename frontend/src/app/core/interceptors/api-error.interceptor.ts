import {
  HttpErrorResponse,
  type HttpInterceptorFn,
} from "@angular/common/http";
import { catchError, throwError } from "rxjs";

import type {
  AnalysisErrorCode,
  AnalysisErrorResponse,
} from "../../../../../contracts/analysis";

export class AnalysisApiError extends Error {
  constructor(
    public readonly code: AnalysisErrorCode,
    public readonly requestId: string | null,
    message: string,
  ) {
    super(message);
    this.name = "AnalysisApiError";
  }
}

function isErrorResponse(value: unknown): value is AnalysisErrorResponse {
  if (typeof value !== "object" || value === null || !("error" in value)) {
    return false;
  }

  const error = (value as { error?: unknown }).error;
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    "message" in error &&
    "requestId" in error
  );
}

export const apiErrorInterceptor: HttpInterceptorFn = (request, next) =>
  next(request).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && isErrorResponse(error.error)) {
        return throwError(
          () =>
            new AnalysisApiError(
              error.error.error.code,
              error.error.error.requestId,
              error.error.error.message,
            ),
        );
      }

      return throwError(
        () =>
          new AnalysisApiError(
            "INTERNAL_ERROR",
            null,
            "Não foi possível concluir a solicitação.",
          ),
      );
    }),
  );
