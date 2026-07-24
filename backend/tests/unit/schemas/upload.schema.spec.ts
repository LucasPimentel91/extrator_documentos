import { describe, expect, it } from "vitest";

import { createUploadSchema } from "../../../src/schemas/upload.schema.js";

const maxSize = 10;
const schema = createUploadSchema(maxSize);

function file(overrides: Record<string, unknown> = {}) {
  return {
    originalName: "norma.txt",
    mimetype: "text/plain",
    size: 4,
    buffer: Buffer.from("text"),
    ...overrides,
  };
}

describe("createUploadSchema", () => {
  it.each([
    ["PDF", "norma.pdf", "application/pdf"],
    [
      "DOCX",
      "norma.docx",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
    ["TXT", "norma.txt", "text/plain"],
  ])("accepts %s with matching extension and MIME", (_kind, name, mimetype) => {
    expect(
      schema.safeParse(file({ originalName: name, mimetype })).success,
    ).toBe(true);
  });

  it("accepts a file exactly at the configured limit", () => {
    expect(
      schema.safeParse(
        file({ size: maxSize, buffer: Buffer.alloc(maxSize, "a") }),
      ).success,
    ).toBe(true);
  });

  it.each([
    ["unsupported extension", { originalName: "norma.exe" }],
    ["MIME mismatch", { originalName: "norma.pdf", mimetype: "text/plain" }],
    ["over limit", { size: 11, buffer: Buffer.alloc(11, "a") }],
    ["empty", { size: 0, buffer: Buffer.alloc(0) }],
  ])("rejects %s", (_label, overrides) => {
    expect(schema.safeParse(file(overrides)).success).toBe(false);
  });
});
