import { basename, extname } from "node:path";

import type { RequestHandler } from "express";
import multer from "multer";

import { AppError } from "../errors/app-error.js";
import {
  ALLOWED_UPLOAD_TYPES,
  createUploadSchema,
} from "../schemas/upload.schema.js";

export function sanitizeFileName(value: string): string {
  return basename(value)
    .split("")
    .filter((character) => {
      const code = character.charCodeAt(0);
      return code > 31 && code !== 127;
    })
    .join("")
    .slice(0, 180);
}

function hasExpectedSignature(extension: string, buffer: Buffer): boolean {
  if (extension === ".pdf") return buffer.subarray(0, 5).toString() === "%PDF-";
  if (extension === ".docx") return buffer.subarray(0, 2).toString() === "PK";
  if (extension === ".txt") return !buffer.includes(0);
  return false;
}

export function createUploadMiddleware(maxFileSizeBytes: number): RequestHandler[] {
  const receive = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: maxFileSizeBytes + 1, files: 1, fields: 0, parts: 2 },
  }).single("file");

  const receiveSafely: RequestHandler = (request, response, next) => {
    receive(request, response, (error) => {
      if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
        next(
          new AppError(
            "FILE_TOO_LARGE",
            413,
            "O arquivo excede o limite permitido.",
          ),
        );
        return;
      }
      if (error instanceof multer.MulterError) {
        next(
          new AppError(
            "INVALID_FILE_TYPE",
            400,
            "Não foi possível receber o arquivo.",
          ),
        );
        return;
      }
      next(error);
    });
  };

  const validate: RequestHandler = (request, _response, next) => {
    if (!request.file) {
      next(new AppError("FILE_REQUIRED", 400, "Selecione um arquivo."));
      return;
    }
    const safeName = sanitizeFileName(request.file.originalname);
    const parsed = createUploadSchema(maxFileSizeBytes).safeParse({
      originalName: safeName,
      mimetype: request.file.mimetype,
      size: request.file.size,
      buffer: request.file.buffer,
    });
    const extension = extname(safeName).toLowerCase();
    if (
      !parsed.success ||
      !hasExpectedSignature(extension, request.file.buffer) ||
      !ALLOWED_UPLOAD_TYPES[
        extension as keyof typeof ALLOWED_UPLOAD_TYPES
      ]
    ) {
      request.file.buffer.fill(0);
      next(
        new AppError(
          request.file.size === 0 ? "EMPTY_FILE" : "INVALID_FILE_TYPE",
          400,
          request.file.size === 0
            ? "O arquivo está vazio."
            : "Formato de arquivo inválido.",
        ),
      );
      return;
    }
    request.file.originalname = safeName;
    next();
  };

  return [receiveSafely, validate];
}
