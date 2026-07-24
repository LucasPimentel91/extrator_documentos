import { AppError } from "../errors/app-error.js";
import { DocxExtractor } from "./extractors/docx.extractor.js";
import type { DocumentTextExtractor } from "./extractors/document-text-extractor.js";
import { PdfExtractor } from "./extractors/pdf.extractor.js";
import { TxtExtractor } from "./extractors/txt.extractor.js";

export interface ExtractedDocument {
  name: string;
  type: string;
  text: string;
  characters: number;
  pages?: Array<{ page: number; text: string }>;
}

const defaultExtractors: Record<string, DocumentTextExtractor> = {
  "application/pdf": new PdfExtractor(),
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    new DocxExtractor(),
  "text/plain": new TxtExtractor(),
};

export class TextExtractionService {
  constructor(
    private readonly extractors: Record<string, DocumentTextExtractor> =
      defaultExtractors,
  ) {}

  async extract(file: {
    name: string;
    type: string;
    buffer: Buffer;
  }): Promise<ExtractedDocument> {
    const extractor = this.extractors[file.type];
    if (!extractor) {
      throw new AppError(
        "INVALID_FILE_TYPE",
        400,
        "Formato de arquivo não permitido.",
      );
    }
    try {
      const extracted = await extractor.extract(file.buffer);
      return {
        name: file.name,
        type: file.type,
        text: extracted.text,
        characters: extracted.text.length,
        pages: extracted.pages,
      };
    } catch {
      throw new AppError(
        "DOCUMENT_UNREADABLE",
        422,
        "Não foi possível ler o documento.",
      );
    }
  }
}
