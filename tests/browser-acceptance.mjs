import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { chromium } from "playwright";

const host = "127.0.0.1";
const port = 4173;
const origin = `http://${host}:${port}`;
const basePath = process.env.VITE_BASE_PATH || "/game-industry-outreach-tracker/";
const appUrl = new URL(basePath, origin).toString();
const storageKey = "studio-outreach-tracker-v1";
const previewEntry = path.resolve("node_modules/vite/bin/vite.js");

async function waitForPreview(server) {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    if (server.exitCode !== null) {
      throw new Error("Vite preview exited before becoming ready.");
    }
    try {
      const response = await fetch(appUrl);
      if (response.ok) return;
    } catch {
      // The preview server is still starting.
    }
    await delay(250);
  }
  throw new Error("Vite preview did not become ready within 20 seconds.");
}

async function performWithDialog(page, action, accept) {
  const dialogResult = new Promise((resolve) => {
    page.once("dialog", async (dialog) => {
      const result = { type: dialog.type(), message: dialog.message() };
      if (accept) await dialog.accept();
      else await dialog.dismiss();
      resolve(result);
    });
  });

  const actionResult = action();
  const [, dialog] = await Promise.all([actionResult, dialogResult]);
  return dialog;
}

async function main() {
  assert.ok(existsSync(path.resolve("dist/index.html")), "Build the production site before browser tests.");
  assert.ok(existsSync(previewEntry), "Vite must be installed before browser tests.");

  const server = spawn(
    process.execPath,
    [previewEntry, "preview", "--host", host, "--port", String(port), "--strictPort"],
    { stdio: "ignore", env: process.env },
  );
  let browser;

  try {
    await waitForPreview(server);
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    const page = await context.newPage();
    const pageErrors = [];
    const writeRequests = [];

    await page.route("https://api.github.com/**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          workflow_runs: [{
            status: "completed",
            conclusion: "success",
            updated_at: "2026-10-31T17:49:00Z",
            html_url: "https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/41225527000",
          }],
        }),
      });
    });
    await page.addInitScript(() => {
      localStorage.setItem("studio-outreach-theme-v1", "light");
      Date.now = () => new Date("2026-10-31T18:00:00.000Z").getTime();
    });

    page.on("pageerror", (error) => pageErrors.push(error.message));
    page.on("request", (request) => {
      if (!["GET", "HEAD"].includes(request.method())) {
        writeRequests.push({ method: request.method(), url: request.url() });
      }
    });

    await page.goto(appUrl, { waitUntil: "networkidle" });
    assert.match(await page.title(), /Game Industry Outreach Tracker/);
    await page.getByRole("heading", { name: "Studio directory" }).waitFor();
    await page.getByText(/Last successful run:/).waitFor();

    await page.getByRole("button", { name: "Switch to dark theme" }).click();
    assert.equal(await page.locator("html").getAttribute("data-bs-theme"), "dark");
    await page.reload({ waitUntil: "networkidle" });
    assert.equal(await page.locator("html").getAttribute("data-bs-theme"), "dark", "Theme choice should persist.");
    await page.getByRole("button", { name: "Switch to light theme" }).click();
    assert.equal(await page.locator("html").getAttribute("data-bs-theme"), "light");

    const rows = page.locator(".studio-table tbody tr");
    const initialCount = await rows.count();
    assert.ok(initialCount > 100, "The global directory should contain a substantial set of active studios.");
    assert.ok(await page.locator(".studio-mark").count() > 100, "Studio marks should appear for directory rows.");
    assert.ok(await page.locator(".country-flag").count() > 100, "Known studio locations should display flags.");
    await page.getByLabel("Show only studios added in the last 24 hours").check();
    assert.equal(await rows.count(), 5, "Only the five recently published closeout studios should appear.");
    assert.equal(await page.getByText("NEW", { exact: true }).count(), 5);
    await page.getByRole("button", { name: "Reset filters" }).click();
    assert.equal(await rows.count(), initialCount, "Reset filters should restore the full directory.");

    // Search and empty-state recovery.
    await page.getByLabel("Search").fill("no-studio-with-this-name-9345");
    await page.getByText("No studios match these filters.").waitFor();
    await page.getByRole("button", { name: "Clear filters" }).click();
    assert.equal(await rows.count(), initialCount, "Clearing filters should restore the directory.");

    await page.getByLabel("Search").fill("4A Games");
    assert.equal(await rows.count(), 1, "A matching studio search should return the intended studio.");
    await rows.getByText("4A Games").waitFor();
    await page.getByLabel("Search").fill("");
    assert.equal(await rows.count(), initialCount, "Clearing a successful search should restore the directory.");

    // Country and work-model filters must actually reduce the visible result set.
    const country = page.locator(".directory-toolbar label:nth-of-type(2) select");
    const countryValues = await country.locator("option").evaluateAll((options) =>
      options.map((option) => option.value),
    );
    const firstCountry = countryValues.find((value) => value !== "All countries");
    assert.ok(firstCountry, "The country filter should contain real countries.");
    await country.selectOption(firstCountry);
    const countryCount = await rows.count();
    assert.ok(countryCount > 0 && countryCount < initialCount, "Country filtering should narrow the directory.");
    await country.selectOption("All countries");

    await page.getByLabel("Work model").selectOption("remote");
    const remoteCount = await rows.count();
    assert.ok(remoteCount > 0 && remoteCount < initialCount, "Work-model filtering should narrow the directory.");
    await page.getByLabel("Work model").selectOption("All work models");
    await page.getByLabel("Search").fill("Laki Studios");
    await page.locator(".directory-toolbar .form-select").first().selectOption("Poland");
    await page.getByRole("button", { name: "Reset filters" }).click();
    assert.equal(await rows.count(), initialCount, "Reset filters should clear search and selects.");

    // Country sorting must follow the visible location and studio-name order.
    await page.getByLabel("Sort by").selectOption("country");
    const locationsAreSorted = await rows.evaluateAll((tableRows) => {
      const values = tableRows.map((row) => ({
        name: row.cells[0]?.textContent?.trim() || "",
        location: row.cells[1]?.textContent?.trim() || "",
      }));
      return values.every((current, index) => {
        if (index === 0) return true;
        const previous = values[index - 1];
        const locationOrder = previous.location.localeCompare(current.location);
        return locationOrder < 0 || (locationOrder === 0 && previous.name.localeCompare(current.name) <= 0);
      });
    });
    assert.equal(locationsAreSorted, true, "Country sorting should be stable by displayed location and studio name.");
    await page.getByLabel("Sort by").selectOption("name");

    // Official route links must remain HTTPS and open safely in a new tab.
    const firstApplicationLink = page.locator(".studio-table tbody tr").first().getByRole("link", { name: "Application" });
    const applicationHref = await firstApplicationLink.getAttribute("href");
    assert.ok(applicationHref?.startsWith("https://"), "Application links must use HTTPS.");
    assert.equal(await firstApplicationLink.getAttribute("target"), "_blank");
    assert.match(await firstApplicationLink.getAttribute("rel") || "", /noopener/);

    // Saving, browser-local persistence and refresh.
    const studioRow = page.getByRole("row").filter({ hasText: "4A Games" });
    assert.equal(await studioRow.count(), 1, "The test studio should appear exactly once.");
    await studioRow.getByRole("button", { name: "Save" }).click();
    await studioRow.getByRole("button", { name: "In tracker" }).waitFor();

    const storedBeforeReload = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) || "[]"), storageKey);
    assert.equal(storedBeforeReload.length, 1);
    assert.equal(storedBeforeReload[0].studioName, "4A Games");
    assert.equal(storedBeforeReload[0].countryCode, "UA", "The headquarters country code should be retained locally.");

    await page.reload({ waitUntil: "networkidle" });
    await page.getByRole("button", { name: /My applications/ }).click();
    await page.getByRole("heading", { name: "My applications" }).waitFor();

    let trackedRow = page.getByRole("row").filter({ hasText: "4A Games" });
    assert.equal(await trackedRow.count(), 1, "A saved studio should survive a full page reload.");
    let status = page.getByLabel("Status for 4A Games");
    assert.equal(await status.inputValue(), "saved");

    // Move through every tracker status. The Applied transition must require confirmation.
    await status.selectOption("in_progress");
    await page.getByRole("tab", { name: /In progress/ }).click();
    status = page.getByLabel("Status for 4A Games");

    const cancelledApply = await performWithDialog(page, () => status.selectOption("applied"), false);
    assert.equal(cancelledApply.type, "confirm");
    assert.match(cancelledApply.message, /Confirm that you have submitted an application/);
    assert.equal(await status.inputValue(), "in_progress", "Dismissing the application confirmation must preserve the status.");

    const acceptedApply = await performWithDialog(page, () => status.selectOption("applied"), true);
    assert.equal(acceptedApply.type, "confirm");
    await page.getByRole("tab", { name: /Applied/ }).click();
    status = page.getByLabel("Status for 4A Games");
    await status.selectOption("interview");

    await page.getByRole("tab", { name: /Interview/ }).click();
    status = page.getByLabel("Status for 4A Games");
    await status.selectOption("offer");

    await page.getByRole("tab", { name: /Offer/ }).click();
    status = page.getByLabel("Status for 4A Games");
    await status.selectOption("archived");

    await page.getByRole("tab", { name: /Archived/ }).click();
    trackedRow = page.getByRole("row").filter({ hasText: "4A Games" });
    assert.equal(await trackedRow.count(), 1, "Archived applications should remain accessible in their status tab.");

    const cancelledRemoval = await performWithDialog(
      page,
      () => trackedRow.getByRole("button", { name: "Remove" }).click(),
      false,
    );
    assert.equal(cancelledRemoval.type, "confirm");
    assert.match(cancelledRemoval.message, /Remove 4A Games from your tracker/);
    assert.equal(await trackedRow.count(), 1, "Dismissing removal confirmation must keep the record.");

    await performWithDialog(
      page,
      () => trackedRow.getByRole("button", { name: "Remove" }).click(),
      true,
    );
    assert.equal(await trackedRow.count(), 0, "Confirming removal should delete the tracker record.");

    await page.getByRole("tab", { name: /Saved/ }).click();
    await page.getByText("No studios in this list yet.").waitFor();
    const storedAfterRemoval = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) || "[]"), storageKey);
    assert.deepEqual(storedAfterRemoval, [], "Removal should persist in browser storage.");

    // Check both mobile layouts and ensure the directory table scrolls inside its container.
    await page.getByRole("button", { name: "Browse studios" }).click();
    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByRole("heading", { name: "Studio directory" }).waitFor();

    const mobileDirectory = await page.evaluate(() => {
      const wrapper = document.querySelector(".studio-table")?.parentElement;
      return {
        viewport: window.innerWidth,
        document: document.documentElement.scrollWidth,
        tableClient: wrapper?.clientWidth ?? 0,
        tableScroll: wrapper?.scrollWidth ?? 0,
      };
    });
    assert.ok(
      mobileDirectory.document <= mobileDirectory.viewport + 1,
      "The mobile directory must not create horizontal page overflow.",
    );
    assert.ok(
      mobileDirectory.tableScroll > mobileDirectory.tableClient,
      "The wide directory table should scroll within its own container on mobile.",
    );

    await page.getByRole("button", { name: /My applications/ }).click();
    const mobileTracker = await page.evaluate(() => ({
      viewport: window.innerWidth,
      document: document.documentElement.scrollWidth,
    }));
    assert.ok(
      mobileTracker.document <= mobileTracker.viewport + 1,
      "The mobile tracker must not create horizontal page overflow.",
    );

    assert.deepEqual(writeRequests, [], "Personal tracker actions must not issue network write requests.");
    assert.deepEqual(pageErrors, [], "The browser should not report uncaught application errors.");

    process.stdout.write(
      "Browser acceptance passed: directory filters/sorting/links, save and reload persistence, all tracker statuses, confirmation dialogs, removal, local-only storage, and desktop/mobile overflow checks.\n",
    );
    await context.close();
  } finally {
    if (browser) await browser.close();
    server.kill("SIGTERM");
  }
}

main().catch((error) => {
  process.stderr.write((error?.stack || String(error)) + "\n");
  process.exitCode = 1;
});
