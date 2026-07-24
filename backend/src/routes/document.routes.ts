import { Router } from "express";

import type { DocumentAnalysisService } from "../services/document-analysis.service.js";
import { createAnalyzeDocumentController } from "../controllers/document.controller.js";
import { createUploadMiddleware } from "../middlewares/upload.middleware.js";

export function createDocumentRouter(
  service: DocumentAnalysisService,
  maxFileSizeBytes: number,
): Router {
  const router = Router();
  router.post(
    "/documents/analyze",
    ...createUploadMiddleware(maxFileSizeBytes),
    createAnalyzeDocumentController(service),
  );
  return router;
}
