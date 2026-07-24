import {
  ensureReadableText,
  type DocumentTextExtractor,
  type ExtractedText,
} from "./document-text-extractor.js";

export class TxtExtractor implements DocumentTextExtractor {
  async extract(buffer: Buffer): Promise<ExtractedText> {
    if (buffer.includes(0)) {
      throw new Error("DOCUMENT_UNREADABLE");
    }
    const decoder = new TextDecoder("utf-8", { fatal: true });
    const text = ensureReadableText(
      decoder.decode(buffer).replace(/^\uFEFF/, ""),
    );
    return { text };
  }
}
