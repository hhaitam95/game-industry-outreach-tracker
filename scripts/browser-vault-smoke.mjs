import { spawn, spawnSync } from "node:child_process";
import {
  chmodSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";

const root = process.cwd();
const reportPath = path.join(root, "test-results", "browser-acceptance-report.md");
const basePath = "/game-industry-outreach-tracker/";
const roleHandoffUrl = "http://127.0.0.1:4174/tests/role-handoff-browser.html";
const url = "http://127.0.0.1:4173" + basePath;
const timeoutMs = 20_000;
const results = [];
let currentStep = "Browser setup";
let failure = null;
let failureReason = "none";
let preview;
let fixtureServer;
let chromePath = null;
let chromeProcess;
let socket;
let tempDir;
let client;

function safeVersion(command, args) {
  const result = spawnSync(command, args, { encoding: "utf8", timeout: 5000 });
  if (result.status !== 0 || result.error) return "unavailable";
  const first = (result.stdout || result.stderr || "").trim().split(/\r?\n/)[0] || "";
  return /^[\w .()+/-]{1,80}$/.test(first) ? first : "available (version omitted)";
}

function findChrome() {
  const candidates = [
    process.env.CHROME_BIN,
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "/opt/google/chrome/chrome",
  ].filter(Boolean);
  return candidates.find((candidate) => existsSync(candidate)) ?? null;
}

function run(command, args, env = process.env) {
  const result = spawnSync(command, args, {
    cwd: root,
    env,
    encoding: "utf8",
    timeout: 180_000,
    maxBuffer: 2 * 1024 * 1024,
  });
  if (result.error || result.status !== 0) throw new Error("command-failed");
}

function validateEncryptedEnvelope(serialized) {
  if (typeof serialized !== "string" || serialized.length === 0) {
    throw new Error("unexpected-envelope-shape");
  }
  let envelope;
  try {
    envelope = JSON.parse(serialized);
  } catch {
    throw new Error("unexpected-envelope-shape");
  }
  const keys = ["format", "version", "cipher", "kdf", "iterations", "salt", "iv", "ciphertext"];
  if (
    !envelope ||
    typeof envelope !== "object" ||
    Array.isArray(envelope) ||
    Object.keys(envelope).length !== keys.length ||
    keys.some((key) => !Object.hasOwn(envelope, key)) ||
    Object.keys(envelope).some((key) => !keys.includes(key)) ||
    envelope.format !== "game-industry-outreach-tracker/encrypted-vault" ||
    envelope.version !== 1 ||
    envelope.cipher !== "AES-GCM-256" ||
    envelope.kdf !== "PBKDF2-SHA-256" ||
    envelope.iterations !== 600_000 ||
    typeof envelope.salt !== "string" ||
    typeof envelope.iv !== "string" ||
    typeof envelope.ciphertext !== "string" ||
    !/^[A-Za-z0-9+/]+={0,2}$/.test(envelope.salt) ||
    !/^[A-Za-z0-9+/]+={0,2}$/.test(envelope.iv) ||
    !/^[A-Za-z0-9+/]+={0,2}$/.test(envelope.ciphertext)
  ) {
    throw new Error("unexpected-envelope-shape");
  }
  if (
    Buffer.from(envelope.salt, "base64").byteLength !== 16 ||
    Buffer.from(envelope.iv, "base64").byteLength !== 12 ||
    Buffer.from(envelope.ciphertext, "base64").byteLength < 16
  ) {
    throw new Error("unexpected-envelope-shape");
  }
  return envelope;
}

async function waitForHttp(target, processRef) {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    if (processRef.exitCode !== null) throw new Error("preview-exited");
    try {
      const response = await fetch(target);
      if (response.ok) return;
    } catch {
      /* Ignore transient startup or cleanup errors. */
    }
    await delay(250);
  }
  throw new Error("preview-not-ready");
}

async function waitForFile(directory, timeout = 15_000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    const files = readdirSync(directory).filter((name) => !name.endsWith(".crdownload") && !name.endsWith(".tmp"));
    if (files.length > 0) return path.join(directory, files[0]);
    await delay(200);
  }
  throw new Error("download-timeout");
}

class DevTools {
  constructor(webSocket) {
    this.socket = webSocket;
    this.nextId = 1;
    this.pending = new Map();
    webSocket.addEventListener("message", (event) => {
      let message;
      try {
        message = JSON.parse(event.data);
      } catch {
        return;
      }
      if (message.method === "Page.javascriptDialogOpening") {
        void this.send("Page.handleJavaScriptDialog", { accept: true }).catch(() => {});
      }
      if (!message.id) return;
      const pending = this.pending.get(message.id);
      if (!pending) return;
      this.pending.delete(message.id);
      clearTimeout(pending.timer);
      if (message.error) pending.reject(new Error("devtools-command-failed"));
      else pending.resolve(message.result ?? {});
    });
  }

  send(method, params = {}) {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error("devtools-timeout"));
      }, timeoutMs);
      this.pending.set(id, { resolve, reject, timer });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }

  async evaluate(expression) {
    const response = await this.send("Runtime.evaluate", {
      expression,
      awaitPromise: true,
      returnByValue: true,
      userGesture: true,
    });
    if (response.exceptionDetails) throw new Error("browser-evaluation-failed");
    return response.result?.value;
  }

  async waitFor(expression, label) {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      if (await this.evaluate(expression)) return;
      await delay(150);
    }
    throw new Error("condition-not-met-" + label);
  }

  async fill(selector, value) {
    const result = await this.evaluate(`(() => {
      const element = document.querySelector(${JSON.stringify(selector)});
      if (!element) return false;
      const prototype = element instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
      const setter = Object.getOwnPropertyDescriptor(prototype, "value")?.set;
      if (!setter) return false;
      setter.call(element, ${JSON.stringify(value)});
      element.dispatchEvent(new Event("input", { bubbles: true }));
      element.dispatchEvent(new Event("change", { bubbles: true }));
      return true;
    })()`);
    if (!result) throw new Error("input-not-found");
  }

  async clickButton(label) {
    const result = await this.evaluate(`(() => {
      const button = [...document.querySelectorAll("button")].find((item) => item.innerText.trim() === ${JSON.stringify(label)});
      if (!button || button.disabled) return false;
      button.click();
      return true;
    })()`);
    if (!result) throw new Error("button-not-found-or-disabled");
  }

  async waitForText(text) {
    const labels = {
      "Speculative applications": "workspace after reload",
      "Private workspace storage": "settings after navigation",
      "Unlock your local vault": "locked vault prompt",
      BROWSER_TEST_STUDIO_CANARY: "application after unlock",
      BROWSER_TEST_PROFILE_CANARY: "profile after unlock",
      "Vault locked.": "lock confirmation",
      "Unable to unlock this backup.": "incorrect passphrase rejection",
      "Backup restored.": "backup restoration",
      "Role handoff test fixture": "role handoff test page",
      "Role details are prefilled only.": "lead prefill notice",
      "Added an interested lead. The record does not indicate a submission.": "saved lead notice",
    };
    await this.waitFor(
      `document.body?.innerText.includes(${JSON.stringify(text)}) ?? false`,
      labels[text] ?? "expected UI state",
    );
  }
}

async function chooseSyntheticResume({ name, type, base64, text }) {
  const bytesExpression = base64
    ? `Uint8Array.from(atob(${JSON.stringify(base64)}), (character) => character.charCodeAt(0))`
    : `new TextEncoder().encode(${JSON.stringify(text ?? "")})`;
  const selected = await client.evaluate(`(() => {
    const input = document.querySelector('[data-testid="resume-file-input"]');
    if (!input || input.disabled) return false;
    const bytes = ${bytesExpression};
    const transfer = new DataTransfer();
    transfer.items.add(new File([bytes], ${JSON.stringify(name)}, { type: ${JSON.stringify(type)} }));
    input.files = transfer.files;
    input.dispatchEvent(new Event("change", { bubbles: true }));
    return true;
  })()`);
  if (!selected) throw new Error("resume-file-input-not-found");
}

async function waitForResumeText(kind, expected) {
  await client.waitFor(
    `document.querySelector('[data-testid="resume-result-kind"]')?.dataset.kind === ${JSON.stringify(kind)} &&
      document.querySelector('[data-testid="resume-status"]')?.dataset.status === "ready" &&
      document.querySelector('[data-testid="resume-extracted-text"]')?.value.includes(${JSON.stringify(expected)})`,
    "resume-" + kind + "-text-extracted",
  );
}

async function step(name, action) {
  const legacyResumeAndOutreachSteps = new Set([
    "Verify versioned outreach and manual application lifecycle",
    "Verify baseline checks and private profile comparison stay in memory",
  ]);
  const legacyRoleHandoffSteps = new Set([
    "Start isolated role-handoff test fixture",
    "Verify role-card handoff requires explicit lead save",
  ]);
  if (process.env.EXPECT_RESUME_LAB !== "1" && legacyResumeAndOutreachSteps.has(name)) {
    results.push({ name, status: "SKIP (outside current acceptance scope)" });
    return;
  }
  if (process.env.EXPECT_ROLE_HANDOFF !== "1" && legacyRoleHandoffSteps.has(name)) {
    results.push({ name, status: "SKIP (outside current acceptance scope)" });
    return;
  }
  currentStep = name;
  await action();
  results.push({ name, status: "PASS" });
}

function saveReport() {
  mkdirSync(path.dirname(reportPath), { recursive: true });
  const passed = results.filter((item) => item.status.startsWith("PASS")).length;
  const lines = [
    "# Browser Acceptance Report",
    "",
    "- Scope: synthetic-data browser test for the speculative-route directory and encrypted local application tracker.",
    "- Runtime: " + safeVersion("node", ["--version"]),
    "- Browser: " + (chromePath ? safeVersion(chromePath, ["--version"]) : "unavailable"),
    "- Result: **" + (failure ? "FAIL" : "PASS") + "**",
    "- Steps passed: " + passed + " / " + results.length,
    "",
    "## 1. What ran and results",
    "",
    ...results.map((item) => "- **" + item.status + "** — " + item.name),
    "",
    "## 2. Errors or issues",
    "",
    failure
      ? "- Failure occurred during: " +
        currentStep +
        ". Safe diagnostic category: " +
        failureReason +
        ". Detailed exception text, file paths, browser logs, and page contents are omitted to avoid exposing private data."
      : "- No browser acceptance failures were detected.",
    "",
    "## 3. Suggested fixes or next steps",
    "",
    ...(failure
      ? [
          "- Confirm a supported Chrome/Chromium browser is installed and available on PATH, or set CHROME_BIN to its executable.",
          "- Re-run `node scripts/browser-vault-smoke.mjs` from the repository root. If it still fails, inspect the browser workflow logs and relevant code without sharing raw private data.",
        ]
      : [
          "- The dummy-data create/save/reload/unlock/encryption/export/lock/restore path passed in this browser run.",
          "- This does not constitute a security audit and does not test malicious extensions, compromised browser software, or cross-device synchronization.",
        ]),
    "",
    "The test uses only synthetic records. It does not read or upload a resume, profile export, or existing browser database. The report excludes raw logs, source contents, file paths, passphrases, and record values.",
    "",
  ];
  writeFileSync(reportPath, lines.join("\n"), { encoding: "utf8", mode: 0o600 });
  chmodSync(reportPath, 0o600);
  process.stdout.write(lines.join("\n"));
}

async function main() {
  chromePath = findChrome();
  if (!chromePath) throw new Error("chrome-not-found");

  if (process.env.SKIP_BROWSER_BUILD !== "1") {
    await step("Build the static app with the repository subpath", async () => {
      run("npm", ["run", "build"], { ...process.env, VITE_BASE_PATH: basePath });
    });
  } else {
    results.push({ name: "Build the static app with the repository subpath", status: "PASS (provided by CI)" });
  }

  tempDir = mkdtempSync(path.join(os.tmpdir(), "studio-outreach-browser-test-"));
  const downloadDir = path.join(tempDir, "downloads");
  const profileDir = path.join(tempDir, "profile");
  mkdirSync(downloadDir);
  mkdirSync(profileDir);

  preview = spawn("npm", ["run", "preview", "--", "--host", "127.0.0.1", "--port", "4173", "--strictPort"], {
    cwd: root,
    env: { ...process.env, VITE_BASE_PATH: basePath },
    stdio: "ignore",
  });
  await step("Start the production preview", () => waitForHttp(url, preview));

  currentStep = "Start headless Chrome";
  chromeProcess = spawn(
    chromePath,
    [
      "--headless=new",
      "--no-sandbox",
      "--disable-gpu",
      "--disable-dev-shm-usage",
      "--no-first-run",
      "--no-default-browser-check",
      "--remote-debugging-address=127.0.0.1",
      "--remote-debugging-port=9222",
      "--remote-allow-origins=*",
      "--user-data-dir=" + profileDir,
      "--download-default-directory=" + downloadDir,
      "about:blank",
    ],
    { stdio: "ignore" },
  );

  const debugPort = 9222;
  let debugReady = false;
  for (let attempt = 0; attempt < 80; attempt += 1) {
    if (chromeProcess.exitCode !== null) throw new Error("browser-exited");
    try {
      const response = await fetch("http://127.0.0.1:" + debugPort + "/json/version");
      if (response.ok) {
        debugReady = true;
        break;
      }
    } catch {
      /* Ignore transient startup or cleanup errors. */
    }
    await delay(150);
  }
  if (!debugReady) throw new Error("browser-debug-port-unavailable");

  currentStep = "Connect to headless Chrome";
  const targetResponse = await fetch("http://127.0.0.1:" + debugPort + "/json/new?about:blank", { method: "PUT" });
  if (!targetResponse.ok) throw new Error("browser-target-unavailable");
  const target = await targetResponse.json();
  socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("websocket-timeout")), timeoutMs);
    socket.addEventListener(
      "open",
      () => {
        clearTimeout(timer);
        resolve();
      },
      { once: true },
    );
    socket.addEventListener(
      "error",
      () => {
        clearTimeout(timer);
        reject(new Error("websocket-failed"));
      },
      { once: true },
    );
  });
  client = new DevTools(socket);
  await client.send("Page.enable");
  await client.send("Runtime.enable");
  await client.send("Page.setDownloadBehavior", { behavior: "allow", downloadPath: downloadDir });
  await client.send("Page.navigate", { url });
  await client.waitForText("Speculative applications");
  const cspDirectives = await client.evaluate(`(() => {
    const policy = document.querySelector('meta[http-equiv="Content-Security-Policy"]')?.content ?? "";
    return {
      defaultSrc: policy.includes("default-src 'self'"),
      scriptSrc: policy.includes("script-src 'self'"),
      workerSrc: policy.includes("worker-src 'self' blob:"),
      connectSrc: policy.includes("connect-src 'self'"),
      objectSrc: policy.includes("object-src 'none'"),
      baseUri: policy.includes("base-uri 'none'"),
      formAction: policy.includes("form-action 'none'"),
      styleSrc: policy.includes("style-src 'self' 'unsafe-inline'")
    };
  })()`);
  if (!cspDirectives || Object.values(cspDirectives).some((present) => !present)) {
    throw new Error("content-security-policy-missing-required-directives");
  }

  if (process.env.EXPECT_SPECULATIVE_DIRECTORY === "1") {
    await step("Verify the curated speculative application list and tracking entry point", async () => {
      await client.clickButton("Speculative applications");
      await client.waitForText("Open application page");
      const directoryState = await client.evaluate(
        "(() => { const routeLinks = [...document.querySelectorAll('.route-directory-links a')]; return { search: Boolean(document.querySelector('#route-search')), routeCards: document.querySelectorAll('[data-testid=speculative-route-card]').length, trackButtons: document.querySelectorAll('[data-testid=track-application-route]').length, officialLinks: routeLinks.length > 0 && routeLinks.every((link) => link.href.startsWith('https://')), showsSupermassive: document.body.innerText.includes('Supermassive Games'), sampleNotice: Boolean(document.querySelector('[data-testid=route-directory-sample-notice]')), studioCards: document.querySelectorAll('.studio-card').length }; })()",
      );
      if (
        !directoryState ||
        !directoryState.search ||
        directoryState.routeCards < 10 ||
        directoryState.trackButtons < 10 ||
        !directoryState.officialLinks ||
        !directoryState.showsSupermassive ||
        directoryState.sampleNotice ||
        directoryState.studioCards !== 0
      ) {
        throw new Error("speculative-directory-core-workflow-failed");
      }
    });
  }

  if (process.env.EXPECT_SPECULATIVE_DIRECTORY === "1") {
    await step("Verify the app exposes only the two core workflows and settings", async () => {
      const state = await client.evaluate(
        "(() => ({ navLabels: [...document.querySelectorAll('nav.main-navigation button')].map((button) => button.innerText.trim()), body: document.body.innerText, studioCards: document.querySelectorAll('.studio-card').length, opportunityRows: document.querySelectorAll('[data-testid=opportunity-row]').length }))()",
      );
      const expectedNavigation = ["Speculative applications", "Applications", "Settings"];
      if (
        !state ||
        state.navLabels.length !== expectedNavigation.length ||
        !expectedNavigation.every((label) => state.navLabels.includes(label)) ||
        ["Overview", "Resume lab", "Outreach"].some((label) => state.navLabels.includes(label)) ||
        state.studioCards !== 0 ||
        state.opportunityRows !== 0 ||
        /Opportunity explorer|roles last seen|No roles observed|Official careers and vacancies/i.test(state.body)
      ) {
        throw new Error("speculative-directory-scope-failed");
      }
    });
  }

  if (process.env.EXPECT_RESUME_LAB === "1") {
    await step("Verify Resume Lab initial state and outbound monitoring", async () => {
      await client.clickButton("Resume lab");
      await client.waitForText("Review a resume without uploading it");
      const initial = await client.evaluate(`(() => ({
        input: Boolean(document.querySelector('[data-testid="resume-file-input"]')),
        guidance: Boolean(document.querySelector('[data-testid="resume-guidance-sources"]')),
        privacyNote: document.querySelector('[data-testid="resume-privacy-note"]')?.innerText.toLowerCase() ?? ""
      }))()`);
      if (!initial?.input || !initial.guidance || !initial.privacyNote.includes("not uploaded")) {
        throw new Error("resume-lab-initial-state-failed");
      }

      await client.evaluate(`(() => {
        window.__resumeOutboundAttempts = [];
        const nativeFetch = window.fetch.bind(window);
        window.fetch = (...args) => {
          const request = args[0];
          const method = (args[1]?.method ?? request?.method ?? "GET").toUpperCase();
          if (!["GET", "HEAD", "OPTIONS"].includes(method)) window.__resumeOutboundAttempts.push("fetch");
          return nativeFetch(...args);
        };
        const nativeOpen = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = function(method, ...args) {
          this.__resumeMethod = String(method).toUpperCase();
          return nativeOpen.call(this, method, ...args);
        };
        const nativeSend = XMLHttpRequest.prototype.send;
        XMLHttpRequest.prototype.send = function(...args) {
          if (this.__resumeMethod && !["GET", "HEAD", "OPTIONS"].includes(this.__resumeMethod)) {
            window.__resumeOutboundAttempts.push("xhr");
          }
          return nativeSend.apply(this, args);
        };
        if (navigator.sendBeacon) {
          const nativeBeacon = navigator.sendBeacon.bind(navigator);
          navigator.sendBeacon = (...args) => {
            window.__resumeOutboundAttempts.push("beacon");
            return nativeBeacon(...args);
          };
        }
        return true;
      })()`);
    });

    await step("Extract synthetic TXT resume", async () => {
      await chooseSyntheticResume({
        name: "synthetic-resume.txt",
        type: "text/plain",
        text: "Synthetic Resume Fixture\\nExperience: Technical support and diagnostics.\\nSkills: TypeScript, Python, REST APIs.",
      });
      await waitForResumeText("txt", "Skills: TypeScript, Python");
    });

    await step("Extract synthetic DOCX resume", async () => {
      const docxBase64 = readFileSync(
        path.join(root, "tests/fixtures/resumes/synthetic-resume.docx.b64"),
        "utf8",
      ).trim();
      await chooseSyntheticResume({
        name: "synthetic-resume.docx",
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        base64: docxBase64,
      });
      await waitForResumeText("docx", "Skills: TypeScript, Python");
    });

    await step("Extract synthetic PDF resume", async () => {
      const pdfBase64 = readFileSync(path.join(root, "tests/fixtures/resumes/synthetic-resume.pdf.b64"), "utf8").trim();
      await chooseSyntheticResume({
        name: "synthetic-resume.pdf",
        type: "application/pdf",
        base64: pdfBase64,
      });
      await waitForResumeText("pdf", "Skills: TypeScript, Python");
    });

    await step("Verify Phase 6c editor and export controls render", async () => {
      await client.waitFor(
        `Boolean(document.querySelector('[data-testid="resume-editor"]') &&
          document.querySelector('[data-testid="resume-export-docx"]') &&
          document.querySelector('[data-testid="resume-export-pdf"]') &&
          document.querySelector('[data-testid="resume-diff"]'))`,
        "resume-structured-editor-rendered",
      );
    });

    await step("Verify manual AI handoff disclosure defaults", async () => {
      await client.clickButton("Review manual AI handoff");
      await client.waitFor(
        `Boolean(document.querySelector('[data-testid="resume-handoff-panel"]'))`,
        "resume-handoff-disclosure-opened",
      );
      const editorReady = await client.evaluate(`(() => ({
        blocks: document.querySelectorAll('[data-testid="resume-editor-block"]').length,
        copyDisabled: document.querySelector('[data-testid="resume-handoff-copy"]')?.disabled ?? false,
        preview: document.querySelector('[data-testid="resume-handoff-preview"]')?.value ?? ""
      }))()`);
      if (!editorReady || editorReady.blocks < 1 || editorReady.copyDisabled !== true || editorReady.preview !== "") {
        throw new Error("resume-export-ui-incomplete");
      }
    });

    await step("Verify section changes are explicit in the before/after diff", async () => {
      const changed = await client.evaluate(`(() => {
        const select = document.querySelector('select[aria-label="Section for block 1"]');
        if (!select) return false;
        const setter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, "value")?.set;
        if (!setter) return false;
        setter.call(select, "Summary");
        select.dispatchEvent(new Event("change", { bubbles: true }));
        const diff = document.querySelector('[data-testid="resume-diff"]');
        if (diff) diff.open = true;
        return true;
      })()`);
      if (!changed) throw new Error("resume-section-select-not-found");
      await client.waitFor(
        `Boolean(document.querySelector('[data-testid="resume-diff-section-change"]')?.innerText.includes("Other → Summary"))`,
        "resume-section-change-label-rendered",
      );
    });

    await step("Verify failed AI paste preserves input for correction", async () => {
      const submitted = await client.evaluate(`(() => {
        const field = document.querySelector('[data-testid="resume-ai-paste"]');
        const button = document.querySelector('[data-testid="resume-ai-paste-add"]');
        const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")?.set;
        if (!field || !button || !setter) return false;
        setter.call(field, "x".repeat(150001));
        field.dispatchEvent(new Event("input", { bubbles: true }));
        field.dispatchEvent(new Event("change", { bubbles: true }));
        button.click();
        return true;
      })()`);
      if (!submitted) throw new Error("resume-ai-paste-controls-not-found");
      await client.waitFor(
        `Boolean(document.querySelector('[data-testid="resume-ai-paste"]')?.value.length === 150001 &&
          document.querySelector('[data-testid="resume-editor-error"]')?.innerText.includes("previous version was kept"))`,
        "resume-ai-paste-failure-preserved",
      );
      await client.evaluate(`(() => {
        const field = document.querySelector('[data-testid="resume-ai-paste"]');
        const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")?.set;
        if (!field || !setter) return false;
        setter.call(field, "");
        field.dispatchEvent(new Event("input", { bubbles: true }));
        field.dispatchEvent(new Event("change", { bubbles: true }));
        return true;
      })()`);
      await client.waitFor(
        `Boolean(document.querySelector('[data-testid="resume-ai-paste"]')?.value.length === 0)`,
        "resume-ai-paste-test-cleanup",
      );
    });

    await step("Verify local-only boundary, failed extraction preservation, and clearing", async () => {
      const noUpload = await client.evaluate(`(() => ({
        attempts: window.__resumeOutboundAttempts?.length ?? -1,
        extracted: document.querySelector('[data-testid="resume-extracted-text"]')?.value ?? ""
      }))()`);
      if (!noUpload || noUpload.attempts !== 0 || !noUpload.extracted.includes("Synthetic Resume Fixture")) {
        throw new Error("resume-local-only-boundary-failed");
      }

      await chooseSyntheticResume({
        name: "unsupported-resume.doc",
        type: "application/msword",
        text: "Not a supported format",
      });
      await client.waitForText("Choose a DOCX, text-based PDF, or UTF-8 text file.");
      const previousExtractionKept = await client.evaluate(
        "document.querySelector('[data-testid=\\\"resume-result-kind\\\"]')?.dataset.kind === 'pdf' && document.querySelector('[data-testid=\\\"resume-extracted-text\\\"]')?.value.includes('Synthetic Resume Fixture')",
      );
      if (!previousExtractionKept) throw new Error("resume-failure-did-not-preserve-previous-extraction");

      await client.clickButton("Clear extracted text");
      const cleared = await client.evaluate(
        "!document.querySelector('[data-testid=\\\"resume-extracted-text\\\"]') && !document.querySelector('[data-testid=\\\"resume-extraction\\\"]')",
      );
      if (!cleared) throw new Error("resume-reset-did-not-clear-text");
    });
  }

  const settingsClicked = await client.evaluate(`(() => {
    const item = [...document.querySelectorAll(".nav-link")].find((element) => element.innerText.trim().includes("Settings"));
    if (!item) return false;
    item.click();
    return true;
  })()`);
  if (!settingsClicked) throw new Error("settings-navigation-not-found");
  await client.waitForText("Private workspace storage");

  await step("Create a new encrypted vault", async () => {
    await client.waitForText("Create an encrypted vault");
    await client.fill("#vault-passphrase", "phase-two-test-passphrase-123");
    await client.clickButton("Create local vault");
    await client.waitForText("Unlocked in memory");
    await client.waitForText("Candidate profile");
  });

  await step("Save synthetic profile", async () => {
    await client.fill("#profile-display-name", "BROWSER_TEST_PROFILE_CANARY");
    await client.fill("#profile-headline", "Synthetic QA Profile");
    await client.fill("#profile-summary", "Synthetic test content only.");
    await client.fill("#profile-target-roles", "Developer Support Specialist\nTechnical Artist");
    await client.fill("#profile-skills", "TypeScript\nPython\nREST APIs\nKibana");
    await client.clickButton("Encrypt and save profile");
    await client.waitForText("Profile encrypted and saved to this browser.");
  });

  await step("Verify versioned outreach and manual application lifecycle", async () => {
    await client.evaluate(
      "(() => { if (window.__phase7OutboundAttempts) return true; window.__phase7OutboundAttempts = []; const nativeFetch = window.fetch.bind(window); window.fetch = (...args) => { const request = args[0]; const method = (args[1]?.method ?? request?.method ?? 'GET').toUpperCase(); if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) window.__phase7OutboundAttempts.push('fetch'); return nativeFetch(...args); }; const nativeOpen = XMLHttpRequest.prototype.open; XMLHttpRequest.prototype.open = function(method, ...args) { this.__phase7Method = String(method).toUpperCase(); return nativeOpen.call(this, method, ...args); }; const nativeSend = XMLHttpRequest.prototype.send; XMLHttpRequest.prototype.send = function(...args) { if (this.__phase7Method && !['GET', 'HEAD', 'OPTIONS'].includes(this.__phase7Method)) window.__phase7OutboundAttempts.push('xhr'); return nativeSend.apply(this, args); }; return true; })()",
    );
    currentStep = "Phase 7 navigation to Outreach";
    const outreachClicked = await client.evaluate(
      "(() => { const item = [...document.querySelectorAll('.nav-link')].find((element) => element.innerText.trim() === 'Outreach'); if (!item) return false; item.click(); return true; })()",
    );
    if (!outreachClicked) throw new Error("phase7-outreach-navigation-not-found");
    currentStep = "Phase 7 Outreach initial render";
    await client.waitForText("Write a thoughtful introduction, not a mass message.");

    currentStep = "Phase 7 studio selection";
    const studioSelected = await client.evaluate(
      "(() => { const label = [...document.querySelectorAll('.phase7-form-grid label')].find((item) => item.innerText.trim().startsWith('Studio')); const select = label?.querySelector('select'); const setter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value')?.set; if (!select || !setter) return false; setter.call(select, 'cd-projekt-red'); select.dispatchEvent(new Event('change', { bubbles: true })); return true; })()",
    );
    if (!studioSelected) throw new Error("phase7-studio-select-not-found");
    await client.fill(
      '[data-testid="outreach-motivation"]',
      "I admire the team's mix of game development and technical problem solving.",
    );
    currentStep = "Phase 7 generate editable template";
    await client.clickButton("Generate editable template");
    currentStep = "Phase 7 generated message appears";
    await client.waitFor(
      `Boolean(document.querySelector('[data-testid="outreach-draft-body"]')?.value.includes("What draws me to your team is:"))`,
      "phase7-generated-message-in-textarea",
    );
    currentStep = "Phase 7 save first draft version";
    await client.clickButton("Save draft version");
    currentStep = "Phase 7 first draft save confirmation";
    await client.waitForText("Draft version 1 encrypted and saved locally.");
    currentStep = "Phase 7 save second reviewed version";
    await client.clickButton("Mark reviewed & save version");
    currentStep = "Phase 7 second draft save confirmation";
    await client.waitForText("Draft version 2 encrypted and saved locally.");
    currentStep = "Phase 7 create lead from saved draft";
    await client.clickButton("Create interested lead from saved version");
    currentStep = "Phase 7 lead save confirmation";
    await client.waitForText("Lead saved locally as interested.");

    currentStep = "Phase 7 navigation to Applications";
    const applicationsClicked = await client.evaluate(
      "(() => { const item = [...document.querySelectorAll('.nav-link')].find((element) => element.innerText.trim() === 'Applications'); if (!item) return false; item.click(); return true; })()",
    );
    if (!applicationsClicked) throw new Error("phase7-applications-navigation-not-found");
    currentStep = "Phase 7 Applications initial render";
    await client.waitForText("Track what actually happened.");
    currentStep = "Phase 7 lead record visible";
    await client.waitForText("CD PROJEKT RED");

    currentStep = "Phase 7 manual applied status confirmation";
    const appliedSelected = await client.evaluate(
      "(() => { const select = document.querySelector('[data-testid=application-status]'); const setter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value')?.set; if (!select || !setter) return false; setter.call(select, 'applied'); select.dispatchEvent(new Event('change', { bubbles: true })); return true; })()",
    );
    if (!appliedSelected) throw new Error("phase7-application-status-not-found");
    currentStep = "Phase 7 submitted status confirmation visible";
    await client.waitForText("Manual submission confirmation recorded.");

    currentStep = "Phase 7 select response activity";
    const responseSelected = await client.evaluate(
      "(() => { const select = document.querySelector('[data-testid=application-activity-type]'); const setter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value')?.set; if (!select || !setter) return false; setter.call(select, 'response'); select.dispatchEvent(new Event('change', { bubbles: true })); const details = document.querySelector('.phase7-activity'); if (details) details.open = true; return Boolean(select); })()",
    );
    if (!responseSelected) throw new Error("phase7-activity-type-not-found");
    await client.fill('[data-testid="application-activity-note"]', "Synthetic recruiter response recorded.");
    currentStep = "Phase 7 save response activity";
    await client.clickButton("Add activity");
    currentStep = "Phase 7 response activity visible";
    await client.waitForText("Synthetic recruiter response recorded.");

    currentStep = "Phase 7 set follow-up date";
    const followUpSet = await client.evaluate(
      "(() => { const input = document.querySelector('[data-testid=application-follow-up-date]'); const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set; if (!input || !setter) return false; setter.call(input, '2026-11-02'); input.dispatchEvent(new Event('input', { bubbles: true })); input.dispatchEvent(new Event('change', { bubbles: true })); return true; })()",
    );
    if (!followUpSet) throw new Error("phase7-follow-up-date-not-found");
    currentStep = "Phase 7 follow-up save confirmation";
    await client.waitForText("Follow-up date saved locally.");

    currentStep = "Phase 7 no-outbound and applied-state assertion";
    const outcome = await client.evaluate(
      "(() => ({ status: document.querySelector('[data-testid=application-status]')?.value ?? '', outboundAttempts: window.__phase7OutboundAttempts?.length ?? -1 }))()",
    );
    if (!outcome || outcome.status !== "applied" || outcome.outboundAttempts !== 0) {
      throw new Error("phase7-application-state-or-privacy-check-failed");
    }

    currentStep = "Phase 7 return to Outreach";
    const backToOutreach = await client.evaluate(
      "(() => { const item = [...document.querySelectorAll('.nav-link')].find((element) => element.innerText.trim() === 'Outreach'); if (!item) return false; item.click(); return true; })()",
    );
    if (!backToOutreach) throw new Error("phase7-outreach-return-not-found");
    currentStep = "Phase 7 version history visible";
    await client.waitForText("Version 2");
    currentStep = "Phase 7 persisted draft version count";
    const storedVersions = await client.evaluate(
      "document.querySelectorAll('[data-testid=outreach-draft-row]').length",
    );
    if (storedVersions < 2) throw new Error("phase7-draft-version-history-incomplete");
    const noOutbound = await client.evaluate("window.__phase7OutboundAttempts?.length ?? -1");
    if (noOutbound !== 0) throw new Error("phase7-outbound-privacy-boundary-failed");
    currentStep = "Phase 7 return to Settings";
    const settingsClicked = await client.evaluate(
      "(() => { const item = [...document.querySelectorAll('.nav-link')].find((element) => element.innerText.trim() === 'Settings'); if (!item) return false; item.click(); return true; })()",
    );
    if (!settingsClicked) throw new Error("settings-navigation-not-found");
    currentStep = "Phase 7 Settings return render";
    await client.waitForText("Private workspace storage");
  });

  await step("Verify baseline checks and private profile comparison stay in memory", async () => {
    const resumeClicked = await client.evaluate(`(() => {
      const item = [...document.querySelectorAll(".nav-link")].find((element) => element.innerText.trim().toLowerCase().includes("resume lab"));
      if (!item) return false;
      item.click();
      return true;
    })()`);
    if (!resumeClicked) throw new Error("resume-navigation-not-found");
    await client.waitForText("Review a resume without uploading it");
    await chooseSyntheticResume({
      name: "synthetic-analysis-resume.txt",
      type: "text/plain",
      text: "Synthetic Analysis Resume\nProfessional Summary\nPython and REST APIs.\nExperience\nTypeScript diagnostics and support.",
    });
    await waitForResumeText("txt", "TypeScript diagnostics");
    await client.fill(
      '[data-testid="resume-analysis-role-description"]',
      "Responsibilities: Python, REST APIs, Jira, Kubernetes, CI/CD. Experience with technical support.",
    );
    await client.clickButton("Run baseline review");
    await client.waitForText("Baseline counts");
    await client.waitForText("Exact text mention found");
    await client.waitForText("No exact text mention detected");
    const analysisState = await client.evaluate(`(() => {
      const results = document.querySelector('[data-testid="resume-analysis-results"]');
      return {
        profileAvailable: Boolean(document.querySelector('[data-testid="resume-analysis-profile-status"]')?.innerText.includes("Using the current in-memory profile")),
        skillMention: Boolean(results?.innerText.includes("Python")),
        noFitScore: !results?.innerText.toLowerCase().includes("fit score:"),
        rawResumeExcluded: !results?.innerText.includes("Synthetic Analysis Resume") && !results?.innerText.includes("TypeScript diagnostics"),
        outboundAttempts: window.__resumeOutboundAttempts?.length ?? -1
      };
    })()`);
    if (
      !analysisState?.profileAvailable ||
      !analysisState.skillMention ||
      !analysisState.noFitScore ||
      !analysisState.rawResumeExcluded ||
      analysisState.outboundAttempts !== 0
    ) {
      throw new Error("resume-analysis-privacy-or-result-check-failed");
    }
    await client.clickButton("Clear extracted text");
    await client.waitForText("Selected file, extracted text, role description and analysis cleared from this screen.");
    const clearedAnalysis = await client.evaluate(
      `!document.querySelector('[data-testid="resume-analysis-results"]') && document.querySelector('[data-testid="resume-analysis-role-description"]')?.value === ''`,
    );
    if (!clearedAnalysis) throw new Error("resume-analysis-clear-did-not-reset-private-inputs");
  });

  await step("Add synthetic application", async () => {
    const settingsClicked = await client.evaluate(`(() => {
      const item = [...document.querySelectorAll(".nav-link")].find((element) => element.innerText.trim().includes("Settings"));
      if (!item) return false;
      item.click();
      return true;
    })()`);
    if (!settingsClicked) throw new Error("settings-navigation-not-found");
    await client.waitForText("Private workspace storage");
    await client.fill("#application-studio", "BROWSER_TEST_STUDIO_CANARY");
    await client.fill("#application-role", "Browser QA Role");
    await client.fill("#application-url", "https://example.com/careers");
    await client.clickButton("Encrypt and add application");
    await client.waitForText("BROWSER_TEST_STUDIO_CANARY");
    await client.waitForText("Application encrypted and saved locally.");
  });

  await step("Reload the app and return to Settings", async () => {
    await client.send("Page.reload");
    await client.waitForText("Speculative applications");
    const settingsClicked = await client.evaluate(`(() => {
      const item = [...document.querySelectorAll(".nav-link")].find((element) => element.innerText.trim().includes("Settings"));
      if (!item) return false;
      item.click();
      return true;
    })()`);
    if (!settingsClicked) throw new Error("settings-navigation-not-found");
    await client.waitForText("Private workspace storage");
  });

  await step("Verify the vault is locked after reload", async () => {
    await client.waitForText("Unlock your local vault");
    const leaked = await client.evaluate(
      "document.body.innerText.includes('BROWSER_TEST_PROFILE_CANARY') || document.body.innerText.includes('BROWSER_TEST_STUDIO_CANARY')",
    );
    if (leaked) throw new Error("private-record-visible-while-locked");
  });

  await step("Reject a wrong passphrase and unlock after reload", async () => {
    await client.fill("#vault-passphrase", "definitely-wrong-dummy-passphrase");
    await client.clickButton("Unlock vault");
    await client.waitForText("Unable to unlock this backup.");
    const leaked = await client.evaluate(
      "document.body.innerText.includes('BROWSER_TEST_PROFILE_CANARY') || document.body.innerText.includes('BROWSER_TEST_STUDIO_CANARY')",
    );
    if (leaked) throw new Error("private-record-visible-while-locked");

    await client.fill("#vault-passphrase", "phase-two-test-passphrase-123");
    await client.clickButton("Unlock vault");
    await client.waitForText("BROWSER_TEST_STUDIO_CANARY");
    const profileName = await client.evaluate("document.querySelector('#profile-display-name')?.value ?? ''");
    if (profileName !== "BROWSER_TEST_PROFILE_CANARY") throw new Error("restored-profile-mismatch");
    const applicationsClicked = await client.evaluate(
      "(() => { const item = [...document.querySelectorAll('.nav-link')].find((element) => element.innerText.trim() === 'Applications'); if (!item) return false; item.click(); return true; })()",
    );
    if (!applicationsClicked) throw new Error("applications-navigation-not-found");
    await client.waitForText("Track what actually happened.");
    await client.waitForText("BROWSER_TEST_STUDIO_CANARY");
    const restoredApplication = await client.evaluate(
      "(() => { const record = [...document.querySelectorAll('[data-testid=application-record]')].find((item) => item.innerText.includes('BROWSER_TEST_STUDIO_CANARY')); return Boolean(record && record.innerText.includes('Browser QA Role') && record.innerText.includes('https://example.com/careers')); })()",
    );
    if (!restoredApplication) throw new Error("application-record-not-restored");
    const phase7SettingsClicked = await client.evaluate(
      "(() => { const item = [...document.querySelectorAll('.nav-link')].find((element) => element.innerText.trim() === 'Settings'); if (!item) return false; item.click(); return true; })()",
    );
    if (!phase7SettingsClicked) throw new Error("settings-navigation-not-found");
    await client.waitForText("Encrypted backup and recovery");
  });

  let encryptedBackupPath;
  await step("Verify IndexedDB and exported backup contain ciphertext, not dummy plaintext", async () => {
    const serialized = await client.evaluate(`(async () => {
      const db = await new Promise((resolve, reject) => {
        const request = indexedDB.open("studio-outreach-private-vault");
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(new Error("indexeddb-open-failed"));
      });
      const value = await new Promise((resolve, reject) => {
        const transaction = db.transaction("encrypted-records", "readonly");
        const request = transaction.objectStore("encrypted-records").get("encrypted-workspace-v1");
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(new Error("indexeddb-read-failed"));
      });
      db.close();
      return value;
    })()`);
    if (typeof serialized !== "string") throw new Error("encrypted-envelope-missing");
    validateEncryptedEnvelope(serialized);
    for (const marker of [
      "BROWSER_TEST_PROFILE_CANARY",
      "BROWSER_TEST_STUDIO_CANARY",
      "Synthetic QA Profile",
      "Browser QA Role",
      "https://example.com/careers",
    ]) {
      if (serialized.includes(marker)) throw new Error("plaintext-found-in-indexeddb");
    }
    await client.clickButton("Download encrypted backup");
    await client.waitForText("Encrypted backup downloaded.");
    encryptedBackupPath = await waitForFile(downloadDir);
    const backup = readFileSync(encryptedBackupPath, "utf8");
    validateEncryptedEnvelope(backup);
    for (const marker of ["BROWSER_TEST_PROFILE_CANARY", "BROWSER_TEST_STUDIO_CANARY"]) {
      if (backup.includes(marker)) throw new Error("plaintext-found-in-backup");
    }
  });

  await step("Lock and unlock the workspace again", async () => {
    await client.clickButton("Lock workspace");
    await client.waitForText("Vault locked.");
    await client.fill("#vault-passphrase", "phase-two-test-passphrase-123");
    await client.clickButton("Unlock vault");
    await client.waitForText("BROWSER_TEST_STUDIO_CANARY");
  });

  await step("Restore the exported backup into a fresh vault", async () => {
    await client.clickButton("Delete local vault");
    await client.waitForText("Not set up");
    await client.fill("#vault-passphrase", "fresh-vault-test-passphrase-456");
    await client.clickButton("Create local vault");
    await client.waitForText("Unlocked in memory");
    await client.fill("#backup-passphrase", "phase-two-test-passphrase-123");
    const document = await client.send("DOM.getDocument", { depth: -1 });
    const node = await client.send("DOM.querySelector", { nodeId: document.root.nodeId, selector: "#backup-file" });
    if (!node.nodeId) throw new Error("backup-input-not-found");
    await client.send("DOM.setFileInputFiles", { files: [encryptedBackupPath], nodeId: node.nodeId });
    await client.waitForText("Backup restored.");
    await client.waitForText("BROWSER_TEST_STUDIO_CANARY");
    const profileName = await client.evaluate("document.querySelector('#profile-display-name')?.value ?? ''");
    if (profileName !== "BROWSER_TEST_PROFILE_CANARY") throw new Error("restored-profile-mismatch");
  });

  await step("Verify the imported backup passphrase unlocks the restored vault", async () => {
    await client.clickButton("Lock workspace");
    await client.waitForText("Vault locked.");
    await client.fill("#vault-passphrase", "phase-two-test-passphrase-123");
    await client.clickButton("Unlock vault");
    await client.waitForText("BROWSER_TEST_STUDIO_CANARY");
  });
  await step("Start isolated role-handoff test fixture", async () => {
    fixtureServer = spawn("npm", ["run", "dev", "--", "--host", "127.0.0.1", "--port", "4174", "--strictPort"], {
      cwd: root,
      env: { ...process.env, VITE_BASE_PATH: "/" },
      stdio: "ignore",
    });
    await waitForHttp(roleHandoffUrl, fixtureServer);
  });

  await step("Verify role-card handoff requires explicit lead save", async () => {
    await client.send("Page.navigate", { url: roleHandoffUrl });
    await client.waitForText("Role handoff test fixture");
    await client.clickButton("Review role against your profile");
    await client.clickButton("Track as a lead in Applications");
    await client.waitForText("Role details are prefilled only.");

    const prefilled = await client.evaluate(`(() => {
      const labels = [...document.querySelectorAll(".phase7-form-grid label")];
      const field = (prefix, selector) =>
        labels.find((label) => label.innerText.trim().startsWith(prefix))?.querySelector(selector)?.value ?? "";
      return {
        studioId: document.querySelector(".phase7-form-grid select")?.value ?? "",
        roleTitle: field("Role / purpose", "input"),
        applicationUrl: field("Official role/application URL", "input"),
        notes: field("Private notes", "textarea"),
        savedCount: Number(document.querySelector('[data-testid="role-handoff-saved-count"]')?.innerText ?? "-1"),
        saveCount: Number(document.querySelector('[data-testid="role-handoff-save-count"]')?.innerText ?? "-1"),
        outboundAttempts: window.__roleHandoffOutboundAttempts?.length ?? -1
      };
    })()`);
    if (
      !prefilled ||
      prefilled.studioId !== "cd-projekt-red" ||
      prefilled.roleTitle !== "Test-only Developer Support Specialist" ||
      prefilled.applicationUrl !== "https://careers.example.test/developer-support" ||
      !prefilled.notes.includes("Verify current availability") ||
      prefilled.savedCount !== 0 ||
      prefilled.saveCount !== 0 ||
      prefilled.outboundAttempts !== 0
    ) {
      throw new Error("role-handoff-prefill-or-auto-save-failed");
    }

    await client.clickButton("Save interested lead");
    await client.waitForText("Added an interested lead. The record does not indicate a submission.");
    const saved = await client.evaluate(`(() => ({
      savedCount: Number(document.querySelector('[data-testid="role-handoff-saved-count"]')?.innerText ?? "-1"),
      saveCount: Number(document.querySelector('[data-testid="role-handoff-save-count"]')?.innerText ?? "-1"),
      status: document.querySelector('[data-testid="role-handoff-saved-status"]')?.innerText ?? "",
      submittedEvents: Number(document.querySelector('[data-testid="role-handoff-submitted-event-count"]')?.innerText ?? "-1"),
      outboundAttempts: window.__roleHandoffOutboundAttempts?.length ?? -1,
      visibleRecords: document.querySelectorAll('[data-testid="application-record"]').length
    }))()`);
    if (
      !saved ||
      saved.savedCount !== 1 ||
      saved.saveCount !== 1 ||
      saved.status !== "interested" ||
      saved.submittedEvents !== 0 ||
      saved.outboundAttempts !== 0 ||
      saved.visibleRecords !== 1
    ) {
      throw new Error("role-handoff-save-or-submission-boundary-failed");
    }
  });
}

try {
  await main();
} catch (error) {
  failure = true;
  const message = error instanceof Error ? error.message : "";
  const safeReasons = new Set([
    "chrome-not-found",
    "command-failed",
    "preview-exited",
    "preview-not-ready",
    "browser-exited",
    "browser-debug-port-unavailable",
    "browser-target-unavailable",
    "websocket-timeout",
    "websocket-failed",
    "devtools-command-failed",
    "devtools-timeout",
    "browser-evaluation-failed",
    "input-not-found",
    "button-not-found-or-disabled",
    "download-timeout",
    "encrypted-envelope-missing",
    "unexpected-envelope-shape",
    "plaintext-found-in-indexeddb",
    "plaintext-found-in-backup",
    "backup-input-not-found",
    "restored-profile-mismatch",
    "private-record-visible-while-locked",
    "phase7-outreach-navigation-not-found",
    "phase7-studio-select-not-found",
    "phase7-applications-navigation-not-found",
    "phase7-application-status-not-found",
    "phase7-activity-type-not-found",
    "phase7-follow-up-date-not-found",
    "phase7-application-state-or-privacy-check-failed",
    "phase7-application-state-not-restored",
    "phase7-restored-record-not-found",
    "phase7-draft-version-history-incomplete",
    "phase7-outbound-privacy-boundary-failed",
    "phase7-outreach-return-not-found",
    "settings-navigation-not-found",
    "applications-navigation-not-found",
    "application-record-not-restored",
    "resume-lab-initial-state-failed",
    "resume-file-input-not-found",
    "resume-export-ui-incomplete",
    "resume-section-select-not-found",
    "resume-ai-paste-controls-not-found",
    "resume-local-only-boundary-failed",
    "resume-failure-did-not-preserve-previous-extraction",
    "resume-reset-did-not-clear-text",
    "role-handoff-prefill-or-auto-save-failed",
    "role-handoff-save-or-submission-boundary-failed",
    "resume-navigation-not-found",
  ]);
  const safeWaitReasons = new Map([
    ["condition-not-met-workspace after reload", "workspace after reload did not appear"],
    ["condition-not-met-settings after navigation", "settings screen did not appear"],
    ["condition-not-met-locked vault prompt", "locked vault prompt did not appear"],
    ["condition-not-met-application after unlock", "application record did not appear after unlock"],
    ["condition-not-met-profile after unlock", "profile record did not appear after unlock"],
    ["condition-not-met-lock confirmation", "lock confirmation did not appear"],
    [
      "condition-not-met-resume-structured-editor-rendered",
      "structured editor/export controls did not appear after PDF extraction",
    ],
    ["condition-not-met-resume-handoff-disclosure-opened", "manual handoff disclosure did not open"],
    ["condition-not-met-resume-section-change-label-rendered", "section-change label did not appear in the diff"],
    ["condition-not-met-resume-ai-paste-failure-preserved", "failed AI-paste content was not preserved"],
    ["condition-not-met-resume-ai-paste-test-cleanup", "synthetic AI-paste test input could not be cleared"],
    ["condition-not-met-role handoff test page", "role handoff test fixture did not load"],
    ["condition-not-met-lead prefill notice", "role lead prefill notice did not appear"],
    ["condition-not-met-saved lead notice", "saved lead confirmation did not appear"],
    ["condition-not-met-incorrect passphrase rejection", "incorrect passphrase was not rejected in the UI"],
    ["condition-not-met-backup restoration", "backup restoration did not complete"],
    [
      "condition-not-met-phase7-generated-message-in-textarea",
      "generated message did not appear in the editable draft field",
    ],
  ]);
  failureReason = safeReasons.has(message)
    ? message
    : (safeWaitReasons.get(message) ??
      (message.startsWith("condition-not-met")
        ? "expected UI state did not appear"
        : "unexpected browser-test failure"));
  if (!results.some((item) => item.name === currentStep)) {
    results.push({ name: currentStep, status: "FAIL" });
  }
} finally {
  try {
    if (socket?.readyState === WebSocket.OPEN) socket.close();
  } catch {
    /* Ignore transient startup or cleanup errors. */
  }
  for (const processRef of [chromeProcess, preview, fixtureServer]) {
    try {
      if (processRef && typeof processRef.kill === "function") processRef.kill("SIGTERM");
    } catch {
      /* Ignore transient startup or cleanup errors. */
    }
  }
  await delay(200);
  if (tempDir) {
    try {
      rmSync(tempDir, { recursive: true, force: true });
    } catch {
      /* Ignore transient startup or cleanup errors. */
    }
  }
  saveReport();
}

if (failure) {
  process.stderr.write(
    "Browser vault smoke test failed during " + currentStep + "; details omitted from output and report.\n",
  );
  process.exitCode = 1;
}
