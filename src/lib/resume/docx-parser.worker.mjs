import mammoth from "mammoth";

self.addEventListener("message", async (event) => {
  const arrayBuffer = event.data;
  if (!(arrayBuffer instanceof ArrayBuffer)) {
    self.postMessage({ ok: false });
    return;
  }

  try {
    const result = await mammoth.extractRawText({ arrayBuffer });
    self.postMessage({
      ok: true,
      text: result.value,
      hasWarnings: result.messages.length > 0,
    });
  } catch {
    self.postMessage({ ok: false });
  }
});
