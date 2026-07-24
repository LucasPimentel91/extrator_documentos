import { extname } from "node:path";

import { z } from "zod";

export const ALLOWED_UPLOAD_TYPES = {
  ".pdf": "application/pdf",
  ".docx":
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".txt": "text/plain",
} as const;

export function createUploadSchema(maxFileSizeBytes: number) {
  return z
    .strictObject({
      originalName: z.string().trim().min(1),
      mimetype: z.string().trim().min(1),
      size: z.number().int().positive().max(maxFileSizeBytes),
      buffer: z.instanceof(Buffer).refine((buffer) => buffer.length > 0),
    })
    .superRefine((file, context) => {
      const extension = extname(file.originalName).toLowerCase();
      const expectedMime =
        ALLOWED_UPLOAD_TYPES[extension as keyof typeof ALLOWED_UPLOAD_TYPES];

      if (!expectedMime || file.mimetype !== expectedMime) {
        context.addIssue({
          code: "custom",
          message: "file extension and MIME type must be supported and match",
          path: ["mimetype"],
        });
      }

      if (file.buffer.length !== file.size) {
        context.addIssue({
          code: "custom",
          message: "declared file size must match buffer length",
          path: ["size"],
        });
      }
    });
}
