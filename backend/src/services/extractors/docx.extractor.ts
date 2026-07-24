import mammoth from "mammoth";

import {
  ensureReadableText,
  type DocumentTextExtractor,
  type ExtractedText,
} from "./document-text-extractor.js";

export class DocxExtractor implements DocumentTextExtractor {
  async extract(buffer: Buffer): Promise<ExtractedText> {
    try {
      const result = await mammoth.extractRawText({ buffer });
      return { text: ensureReadableText(result.value) };
    } catch {
      throw new Error("DOCUMENT_UNREADABLE");
    }
  }
}
