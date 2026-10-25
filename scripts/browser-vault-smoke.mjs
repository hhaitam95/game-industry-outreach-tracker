import { spawn, spawnSync } from "node:child_process";
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";

const root = process.cwd();
const reportPath = path.join(root, "test-results", "phase2-browser-smoke-report.md");
const basePath = "/game-industry-outreach-tracker/";
const url = "http://127.0.0.1:4173" + basePath;
const timeoutMs = 20_000;
const results = [];
let currentStep = "Browser setup";
let failure = null;
let failureReason = "none";
let preview;
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
  const result = spawnSync(command, args, { cwd: root, env, encoding: "utf8", timeout: 180_000, maxBuffer: 2 * 1024 * 1024 });
  if (result.error || result.status !== 0) throw new Error("command-failed");
}

async function waitForHttp(target, processRef) {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    if (processRef.exitCode !== null) throw new Error("preview-exited");
    try {
      const response = await fetch(target);
      if (response.ok) return;
    } catch {}
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
    await this.waitFor(`document.body?.innerText.includes(${JSON.stringify(text)}) ?? false`, "text");
  }
}

async function step(name, action) {
  currentStep = name;
  await action();
  results.push({ name, status: "PASS" });
}

function saveReport() {
  mkdirSync(path.dirname(reportPath), { recursive: true });
  const passed = results.filter((item) => item.status.startsWith("PASS")).length;
  const lines = [
    "# Phase 2 Browser Acceptance Report",
    "",
    "- Scope: dummy-data-only browser smoke test for the encrypted local vault.",
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
      ? "- Failure occurred during: " + currentStep + ". Safe diagnostic category: " + failureReason + ". Detailed exception text, file paths, browser logs, and page contents are omitted to avoid exposing private data."
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

  chromeProcess = spawn(chromePath, [
    "--headless=new",
    "--no-sandbox",
    "--disable-gpu",
    "--disable-dev-shm-usage",
    "--no-first-run",
    "--no-default-browser-check",
    "--remote-debugging-port=0",
    "--remote-allow-origins=*",
    "--user-data-dir=" + profileDir,
    "--download-default-directory=" + downloadDir,
    "about:blank",
  ], { stdio: "ignore" });

  let debugPort = null;
  const activePortFile = path.join(profileDir, "DevToolsActivePort");
  for (let attempt = 0; attempt < 80; attempt += 1) {
    if (chromeProcess.exitCode !== null) throw new Error("browser-exited");
    try {
      const port = Number(readFileSync(activePortFile, "utf8").split(/\r?\n/)[0]);
      if (Number.isInteger(port) && port > 0) {
        debugPort = port;
        break;
      }
    } catch {}
    await delay(150);
  }
  if (!debugPort) throw new Error("browser-debug-port-unavailable");

  const targetResponse = await fetch("http://127.0.0.1:" + debugPort + "/json/new?about:blank", { method: "PUT" });
  if (!targetResponse.ok) throw new Error("browser-target-unavailable");
  const target = await targetResponse.json();
  socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("websocket-timeout")), timeoutMs);
    socket.addEventListener("open", () => {
      clearTimeout(timer);
      resolve();
    }, { once: true });
    socket.addEventListener("error", () => {
      clearTimeout(timer);
      reject(new Error("websocket-failed"));
    }, { once: true });
  });
  client = new DevTools(socket);
  await client.send("Page.enable");
  await client.send("Runtime.enable");
  await client.send("Page.setDownloadBehavior", { behavior: "allow", downloadPath: downloadDir });
  await client.send("Page.navigate", { url });
  await client.waitForText("Your workspace");
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
    await client.clickButton("Encrypt and save profile");
    await client.waitForText("Profile encrypted and saved to this browser.");
  });

  await step("Add synthetic application", async () => {
    await client.fill("#application-studio", "BROWSER_TEST_STUDIO_CANARY");
    await client.fill("#application-role", "Browser QA Role");
    await client.fill("#application-url", "https://example.com/careers");
    await client.clickButton("Encrypt and add application");
    await client.waitForText("BROWSER_TEST_STUDIO_CANARY");
    await client.waitForText("Application encrypted and saved locally.");
  });

  await step("Reload and verify the vault locks before displaying records", async () => {
    await client.send("Page.reload");
    await client.waitForText("Your workspace");
    const settingsClicked = await client.evaluate(`(() => {
      const item = [...document.querySelectorAll(".nav-link")].find((element) => element.innerText.trim().includes("Settings"));
      if (!item) return false;
      item.click();
      return true;
    })()`);
    if (!settingsClicked) throw new Error("settings-navigation-not-found");
    await client.waitForText("Unlock your local vault");
    const leaked = await client.evaluate("document.body.innerText.includes('BROWSER_TEST_PROFILE_CANARY') || document.body.innerText.includes('BROWSER_TEST_STUDIO_CANARY')");
    if (leaked) throw new Error("private-record-visible-while-locked");
    await client.fill("#vault-passphrase", "phase-two-test-passphrase-123");
    await client.clickButton("Unlock vault");
    await client.waitForText("BROWSER_TEST_STUDIO_CANARY");
    await client.waitForText("BROWSER_TEST_PROFILE_CANARY");
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
    const envelope = JSON.parse(serialized);
    const keys = ["format", "version", "cipher", "kdf", "iterations", "salt", "iv", "ciphertext"];
    if (keys.some((key) => !Object.hasOwn(envelope, key)) || Object.keys(envelope).length !== keys.length) {
      throw new Error("unexpected-envelope-shape");
    }
    for (const marker of ["BROWSER_TEST_PROFILE_CANARY", "BROWSER_TEST_STUDIO_CANARY", "Synthetic test content only."]) {
      if (serialized.includes(marker)) throw new Error("plaintext-found-in-indexeddb");
    }
    await client.clickButton("Download encrypted backup");
    await client.waitForText("Encrypted backup downloaded.");
    encryptedBackupPath = await waitForFile(downloadDir);
    const backup = readFileSync(encryptedBackupPath, "utf8");
    JSON.parse(backup);
    for (const marker of ["BROWSER_TEST_PROFILE_CANARY", "BROWSER_TEST_STUDIO_CANARY", "Synthetic test content only."]) {
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
}

try {
  await main();
} catch (error) {
  failure = true;
  const message = error instanceof Error ? error.message : "";
  const safeReasons = new Set([
    "chrome-not-found", "command-failed", "preview-exited", "preview-not-ready", "browser-exited",
    "browser-debug-port-unavailable", "browser-target-unavailable", "websocket-timeout", "websocket-failed",
    "devtools-command-failed", "devtools-timeout", "browser-evaluation-failed", "input-not-found",
    "button-not-found-or-disabled", "download-timeout", "encrypted-envelope-missing", "unexpected-envelope-shape",
    "plaintext-found-in-indexeddb", "plaintext-found-in-backup", "backup-input-not-found", "restored-profile-mismatch",
    "private-record-visible-while-locked", "settings-navigation-not-found",
  ]);
  failureReason = safeReasons.has(message) ? message : message.startsWith("condition-not-met") ? "expected UI state did not appear" : "unexpected browser-test failure";
  if (!results.some((item) => item.name === currentStep)) {
    results.push({ name: currentStep, status: "FAIL" });
  }
} finally {
  try {
    if (socket?.readyState === WebSocket.OPEN) socket.close();
  } catch {}
  for (const processRef of [chromeProcess, preview]) {
    try {
      if (processRef && typeof processRef.kill === "function") processRef.kill("SIGTERM");
    } catch {}
  }
  await delay(200);
  if (tempDir) {
    try {
      rmSync(tempDir, { recursive: true, force: true });
    } catch {}
  }
  saveReport();
}

if (failure) {
  process.stderr.write("Browser vault smoke test failed during " + currentStep + "; details omitted from output and report.\n");
  process.exitCode = 1;
}
