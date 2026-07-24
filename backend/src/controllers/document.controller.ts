import type { RequestHandler } from "express";

import type { DocumentAnalysisService } from "../services/document-analysis.service.js";

export function createAnalyzeDocumentController(
  service: DocumentAnalysisService,
): RequestHandler {
  return async (request, response) => {
    const controller = new AbortController();
    response.on("close", () => controller.abort());
    const file = request.file!;
    const result = await service.analyze(
      {
        name: file.originalname,
        type: file.mimetype,
        buffer: file.buffer,
      },
      controller.signal,
    );
    response.status(200).json(result);
  };
}
