export type PublicErrorCode =
  | "FILE_REQUIRED"
  | "INVALID_FILE_TYPE"
  | "FILE_TOO_LARGE"
  | "EMPTY_FILE"
  | "DOCUMENT_UNREADABLE"
  | "RATE_LIMITED"
  | "AI_INVALID_RESPONSE"
  | "AI_UNAVAILABLE"
  | "AI_TIMEOUT"
  | "INTERNAL_ERROR";

export class AppError extends Error {
  constructor(
    public readonly code: PublicErrorCode,
    public readonly status: number,
    public readonly publicMessage: string,
    options?: ErrorOptions,
  ) {
    super(publicMessage, options);
    this.name = "AppError";
  }
}
