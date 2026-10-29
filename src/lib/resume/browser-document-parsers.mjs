import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { MAX_RESUME_PDF_PAGES, MAX_RESUME_TEXT_CHARS, ResumeExtractionError } from "./document-extractor.mjs";
import { RESUME_PARSE_TIMEOUT_MS, withParseTimeout } from "./parse-timeout.mjs";

GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

/**
 * Extract DOCX text in a dedicated worker so the timeout can terminate parser execution.
 * @param {ArrayBuffer} arrayBuffer
 * @returns {Promise<{ text: string, warnings: string[] }>}
 */
export function extractDocxText(arrayBuffer) {
  return new Promise((resolve, reject) => {
    let settled = false;
    /** @type {ReturnType<typeof setTimeout> | undefined} */
    let timeoutId;
    /** @type {Worker | undefined} */
    let worker;

    const cleanup = () => {
      settled = true;
      if (timeoutId !== undefined) clearTimeout(timeoutId);
      worker?.terminate();
    };
    const fail = () => {
      if (settled) return;
      cleanup();
      reject(new ResumeExtractionError("parser-failed"));
    };
    /** @param {{ text: string, warnings: string[] }} result */
    const succeed = (result) => {
      if (settled) return;
      cleanup();
      resolve(result);
    };

    try {
      worker = new Worker(new URL("./docx-parser.worker.mjs", import.meta.url), { type: "module" });
    } catch {
      fail();
      return;
    }

    timeoutId = setTimeout(fail, RESUME_PARSE_TIMEOUT_MS);
    worker.onmessage = (event) => {
      const response = event.data;
      if (
        !response ||
        response.ok !== true ||
        typeof response.text !== "string" ||
        typeof response.hasWarnings !== "boolean"
      ) {
        fail();
        return;
      }
      succeed({
        text: response.text,
        warnings: response.hasWarnings ? ["docx-structure-warning"] : [],
      });
    };
    worker.onerror = fail;

    try {
      worker.postMessage(arrayBuffer, [arrayBuffer]);
    } catch {
      fail();
    }
  });
}

/** @param {ArrayBuffer} arrayBuffer */
export async function extractPdfText(arrayBuffer) {
  const loadingTask = getDocument({
    data: new Uint8Array(arrayBuffer),
    enableXfa: false,
    useWorkerFetch: false,
  });
  const parseDocument = async () => {
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
  };

  try {
    return await withParseTimeout(parseDocument(), RESUME_PARSE_TIMEOUT_MS);
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
