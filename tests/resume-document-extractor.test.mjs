import assert from "node:assert/strict";
import test from "node:test";
import {
  classifyResumeFile,
  extractResumeDocument,
  getResumeExtractionErrorMessage,
  getResumeWarningMessage,
  MAX_RESUME_FILE_BYTES,
  MAX_RESUME_PDF_PAGES,
  MAX_RESUME_TEXT_CHARS,
  normalizeExtractedText,
} from "../src/lib/resume/document-extractor.mjs";

function localFile(name, type, bytes, sizeOverride = bytes.byteLength) {
  const copy = bytes.slice();
  return {
    name,
    type,
    size: sizeOverride,
    async arrayBuffer() {
      const buffer = new ArrayBuffer(copy.byteLength);
      new Uint8Array(buffer).set(copy);
      return buffer;
    },
  };
}

function textFile(text = "Synthetic Resume\r\n\r\nSkills: TypeScript, Python") {
  return localFile("synthetic-resume.txt", "text/plain", new TextEncoder().encode(text));
}

test("classifies supported local formats and checks metadata before reading", () => {
  assert.equal(
    classifyResumeFile(
      localFile(
        "candidate.docx",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        new Uint8Array([1]),
      ),
    ),
    "docx",
  );
  assert.equal(classifyResumeFile(localFile("candidate.pdf", "application/pdf", new Uint8Array([1]))), "pdf");
  assert.equal(classifyResumeFile(textFile()), "txt");
  assert.throws(
    () => classifyResumeFile(localFile("candidate.doc", "application/msword", new Uint8Array([1]))),
    /DOCX, text-based PDF/,
  );
  assert.throws(
    () => classifyResumeFile(localFile("candidate.pdf", "text/plain", new Uint8Array([1]))),
    /do not match/,
  );
  assert.throws(() => classifyResumeFile(localFile("empty.txt", "text/plain", new Uint8Array([]))), /empty/);
  assert.throws(
    () => classifyResumeFile(localFile("large.txt", "text/plain", new Uint8Array([1]), MAX_RESUME_FILE_BYTES + 1)),
    /10 MiB/,
  );
});

test("normalizes line endings/control characters while retaining paragraph breaks", () => {
  assert.equal(normalizeExtractedText("  Alpha  \r\n\r\n\r\nBe\u0000ta \t\rGamma  "), "Alpha\n\nBeta\nGamma");
  assert.equal(normalizeExtractedText("  Alpha\r\n\r\nBeta  "), "Alpha\n\nBeta");
});

test("extracts UTF-8 text locally and returns only bounded in-memory output metadata", async () => {
  const result = await extractResumeDocument(textFile());
  assert.equal(result.kind, "txt");
  assert.equal(result.status, "ready");
  assert.match(result.text, /Skills: TypeScript, Python/);
  assert.equal(result.pageCount, null);
  assert.equal(result.characterCount, result.text.length);
  assert.deepEqual(
    Object.keys(result).sort(),
    ["characterCount", "fileName", "kind", "pageCount", "sizeBytes", "status", "text", "warnings"].sort(),
  );
});

test("invalid UTF-8 and unknown parser failures use fixed safe messages", async () => {
  const file = localFile("bad.txt", "text/plain", new Uint8Array([0xff, 0xfe]));
  await assert.rejects(() => extractResumeDocument(file), /valid UTF-8/);
  assert.equal(
    getResumeExtractionErrorMessage(new Error("PRIVATE_CONTENT_123")),
    "The document could not be read. It may be damaged, encrypted, or use unsupported features.",
  );
});

test("DOCX parser warnings are reduced to allowlisted categories", async () => {
  const file = localFile(
    "resume.docx",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    new Uint8Array([1]),
  );
  const result = await extractResumeDocument(file, {
    extractDocxText: async () => ({
      text: "Synthetic Candidate\nSkills: Python",
      warnings: ["docx-structure-warning", "PRIVATE_RAW_PARSER_DETAIL"],
    }),
  });
  assert.equal(result.status, "warning");
  assert.deepEqual(result.warnings, ["docx-structure-warning"]);
  assert.doesNotMatch(JSON.stringify(result), /PRIVATE_RAW_PARSER_DETAIL/);
});

test("empty PDFs are reported as having no selectable text, not as success", async () => {
  const file = localFile("scan.pdf", "application/pdf", new Uint8Array([1]));
  const result = await extractResumeDocument(file, {
    extractPdfText: async () => ({ text: "", pageCount: 2, warnings: [] }),
  });
  assert.equal(result.status, "warning");
  assert.equal(result.pageCount, 2);
  assert.deepEqual(result.warnings, ["no-selectable-text"]);
  assert.match(getResumeWarningMessage(result.warnings[0]), /No selectable text was found/);
});

test("page, output-length, and parser-error limits fail closed", async () => {
  const pdf = localFile("many-pages.pdf", "application/pdf", new Uint8Array([1]));
  await assert.rejects(
    () =>
      extractResumeDocument(pdf, {
        extractPdfText: async () => ({ text: "text", pageCount: MAX_RESUME_PDF_PAGES + 1 }),
      }),
    /more than 100 pages/,
  );
  const docx = localFile(
    "too-long.docx",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    new Uint8Array([1]),
  );
  await assert.rejects(
    () =>
      extractResumeDocument(docx, {
        extractDocxText: async () => ({ text: "x".repeat(MAX_RESUME_TEXT_CHARS + 1) }),
      }),
    /150,000-character limit/,
  );
  await assert.rejects(
    () =>
      extractResumeDocument(docx, {
        extractDocxText: async () => {
          throw new Error("RAW PRIVATE DIAGNOSTIC");
        },
      }),
    /could not be read/,
  );
});
