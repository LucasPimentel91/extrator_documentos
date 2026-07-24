export interface ExtractedText {
  text: string;
  pages?: Array<{ page: number; text: string }>;
}

export interface DocumentTextExtractor {
  extract(buffer: Buffer): Promise<ExtractedText>;
}

export function ensureReadableText(text: string): string {
  const normalized = text.replace(/\r\n?/g, "\n").trim();
  if (!normalized) {
    throw new Error("DOCUMENT_UNREADABLE");
  }
  return normalized;
}
