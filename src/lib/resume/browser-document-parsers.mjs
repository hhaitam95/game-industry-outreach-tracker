import mammoth from "mammoth";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import {
  MAX_RESUME_PDF_PAGES,
  MAX_RESUME_TEXT_CHARS,
  ResumeExtractionError,
} from "./document-extractor.mjs";

GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

/** @param {ArrayBuffer} arrayBuffer */
export async function extractDocxText(arrayBuffer) {
  try {
    const result = await mammoth.extractRawText({ arrayBuffer });
    return {
      text: result.value,
      warnings: result.messages.length ? ["docx-structure-warning"] : [],
    };
  } catch {
    throw new ResumeExtractionError("parser-failed");
  }
}

/** @param {ArrayBuffer} arrayBuffer */
export async function extractPdfText(arrayBuffer) {
  const loadingTask = getDocument({
    data: new Uint8Array(arrayBuffer),
    useWorkerFetch: false,
  });
  try {
    const document = await loadingTask.promise;
    if (document.numPages > MAX_RESUME_PDF_PAGES) {
      throw new ResumeExtractionError("too-many-pages");
    }

    /** @type {string[]} */
    const pageTexts = [];
    let length = 0;
    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
      const page = await document.getPage(pageNumber);
      const content = await page.getTextContent();
      const pageText = content.items
        .filter((item) => "str" in item)
        .map((item) => {
          if (item.hasEOL) {
            return item.str + "\n";
          }
          return item.str + " ";
        })
        .join("");
      length += pageText.length;
      if (length > MAX_RESUME_TEXT_CHARS) {
        throw new ResumeExtractionError("output-too-large");
      }
      pageTexts.push(pageText);
      page.cleanup();
    }
    return {
      text: pageTexts.join("\n"),
      pageCount: document.numPages,
      warnings: [],
    };
  } catch (error) {
    if (error instanceof ResumeExtractionError) {
      throw error;
    }
    throw new ResumeExtractionError("parser-failed");
  } finally {
    try {
      await loadingTask.destroy();
    } catch {
      // Cleanup errors are deliberately not exposed or logged.
    }
  }
}
