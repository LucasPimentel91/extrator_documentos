import { PDFParse } from "pdf-parse";

import {
  ensureReadableText,
  type DocumentTextExtractor,
  type ExtractedText,
} from "./document-text-extractor.js";

export class PdfExtractor implements DocumentTextExtractor {
  async extract(buffer: Buffer): Promise<ExtractedText> {
    const parser = new PDFParse({ data: buffer });
    try {
      const result = await parser.getText();
      const pages = result.pages.map((page, index) => ({
        page: index + 1,
        text: page.text.trim(),
      }));
      return { text: ensureReadableText(result.text), pages };
    } catch {
      throw new Error("DOCUMENT_UNREADABLE");
    } finally {
      await parser.destroy();
    }
  }
}
