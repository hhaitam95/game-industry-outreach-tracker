import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
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
    const posterFixture = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8AAAAMBAQDJ/pLvAAAAAElFTkSuQmCC", "base64");
    const landscapeFixture = Buffer.from(
      '<svg xmlns="http://www.w3.org/2000/svg" width="460" height="215" viewBox="0 0 460 215"><rect width="460" height="215" fill="#345"/><text x="230" y="118" fill="white" text-anchor="middle" font-size="24">Landscape artwork</text></svg>',
    );
    await page.route("**/*", async route => {
      const requestUrl = route.request().url();
      if (
        requestUrl.includes("images.igdb.com") ||
        requestUrl.includes("d4ngames.com") ||
        requestUrl.includes("www.ahoiii.com") ||
        requestUrl.includes("mzstatic.com")
      ) {
        await route.fulfill({ status: 200, contentType: "image/png", body: posterFixture });
        return;
      }
      if (!requestUrl.includes("steamstatic")) {
        await route.continue();
        return;
      }
      const url = new URL(requestUrl);
      const isTrailPortrait = url.pathname.includes("/steam/apps/3544920/") && url.pathname.includes("library_600x900");
      if (isTrailPortrait) {
        await route.fulfill({ status: 404 });
        return;
      }
      const isHeader = url.pathname.endsWith("/header.jpg");
      await route.fulfill({
        status: 200,
        contentType: isHeader ? "image/svg+xml" : "image/png",
        body: isHeader ? landscapeFixture : posterFixture,
      });
    });
    await page.addInitScript(() => {
      if (!localStorage.getItem("studio-outreach-theme-v1")) {
        localStorage.setItem("studio-outreach-theme-v1", "light");
      }
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
    assert.equal(await page.locator(".workspace-label").count(), 0, "The redundant workspace label should not be displayed.");
    assert.equal((await page.locator(".theme-toggle").innerText()).trim(), "◐", "The theme control should show only its icon.");
    assert.ok(
      Number.parseFloat(await page.locator("body").evaluate(element => getComputedStyle(element).fontSize)) >= 17,
      "The global page typography should be larger than the 16px browser baseline.",
    );
    await page.getByRole("heading", { name: "Studio directory" }).waitFor();
    await page.getByText(/Last successful run:/).waitFor();

    // Candidate Profile is private browser-local data, including original document bytes.
    await page.getByRole("button", { name: "My profile" }).click();
    await page.getByRole("heading", { name: "My profile" }).waitFor();
    await page.getByLabel("Full name").fill("Test Candidate");
    await page.getByLabel("Email").fill("candidate@example.test");
    await page.getByLabel("Current location").fill("Budapest, Hungary");
    await page.getByLabel("Professional summary").fill("A test profile with an evidence-backed technical background.");
    // Switching views must not discard profile edits that have not yet been saved.
    await page.getByRole("button", { name: "Studios", exact: true }).click();
    await page.getByRole("button", { name: "My profile" }).click();
    assert.equal(await page.getByLabel("Full name").inputValue(), "Test Candidate");
    await page.getByRole("button", { name: /Add experience/ }).click();
    await page.getByLabel("Employer").fill("Example Studio");
    await page.getByLabel("Exact job title").fill("Product Support Engineer");
    await page.getByLabel("Start date").fill("Sep 2023");
    await page.getByLabel("Responsibilities").fill("Investigated application and API issues.");
    await page.getByRole("button", { name: /Add education/ }).click();
    await page.getByLabel("Qualification").fill("MSc Computer Science");
    await page.getByLabel("Institution").fill("Example University");
    await page.getByRole("button", { name: /Add project or training/ }).click();
    await page.getByRole("textbox", { name: "Type", exact: true }).fill("Bootcamp");
    await page.getByLabel("Description and your contribution").fill("Completed a practical training project.");
    await page.getByRole("button", { name: /Add skill/ }).click();
    await page.getByLabel("Skill or technology").fill("REST APIs");
    await page.getByLabel("Evidence level").selectOption("demonstrated");
    await page.getByLabel("Evidence source").fill("Example Studio · Product Support Engineer");
    await page.getByLabel("What supports this assessment?").fill("Investigated and troubleshot API behavior in production.");
    await page.getByLabel("Role families").fill("Developer support\nDevOps");
    await page.getByLabel("Preferred regions").fill("Europe\nUnited Kingdom");
    await page.getByLabel("Motivation text").fill("I am interested in contributing to game development teams.");
    const resumeFixture = Buffer.from("%PDF-1.4\\nCandidate resume fixture\\n%%EOF");
    await page.locator(".profile-material-card").first().locator('input[type="file"]').setInputFiles({
      name: "candidate-resume.pdf",
      mimeType: "application/pdf",
      buffer: resumeFixture,
    });
    await page.getByText("candidate-resume.pdf").waitFor();
    await page.locator(".profile-actions").getByRole("button", { name: "Save profile" }).click();
    await page.getByRole("button", { name: "Profile saved" }).waitFor();

    const savedCandidateProfile = await page.evaluate(() => new Promise((resolve, reject) => {
      const openRequest = indexedDB.open("game-industry-outreach-private", 1);
      openRequest.onerror = () => reject(openRequest.error);
      openRequest.onsuccess = () => {
        const transaction = openRequest.result.transaction("candidate-profile", "readonly");
        const request = transaction.objectStore("candidate-profile").get("primary");
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result?.profile);
      };
    }));
    assert.equal(savedCandidateProfile.personal.fullName, "Test Candidate");
    assert.equal(savedCandidateProfile.experience[0].title, "Product Support Engineer");
    assert.equal(savedCandidateProfile.education[0].qualification, "MSc Computer Science");
    assert.equal(savedCandidateProfile.skills[0].evidence, "demonstrated");
    assert.equal(savedCandidateProfile.preferences.preferredRegions[0], "Europe");
    assert.equal(savedCandidateProfile.materials.masterResume.name, "candidate-resume.pdf");
    assert.equal(Buffer.from(savedCandidateProfile.materials.masterResume.dataBase64, "base64").toString(), resumeFixture.toString());

    await page.reload({ waitUntil: "networkidle" });
    await page.getByRole("button", { name: "My profile" }).click();
    await page.getByRole("heading", { name: "My profile" }).waitFor();
    assert.equal(await page.getByLabel("Full name").inputValue(), "Test Candidate", "The structured profile should survive a page reload.");
    assert.equal(await page.getByLabel("Motivation text").inputValue(), "I am interested in contributing to game development teams.");
    await page.getByText("candidate-resume.pdf").waitFor();

    const [profileBackupDownload] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: "Export backup" }).click(),
    ]);
    const profileBackup = JSON.parse(readFileSync(await profileBackupDownload.path(), "utf8"));
    assert.equal(profileBackup.format, "game-industry-outreach-candidate-profile");
    assert.equal(profileBackup.profile.personal.fullName, "Test Candidate");
    assert.equal(profileBackup.profile.materials.masterResume.dataBase64, savedCandidateProfile.materials.masterResume.dataBase64);

    await page.evaluate(() => new Promise((resolve, reject) => {
      const openRequest = indexedDB.open("game-industry-outreach-private", 1);
      openRequest.onerror = () => reject(openRequest.error);
      openRequest.onsuccess = () => {
        const transaction = openRequest.result.transaction("candidate-profile", "readwrite");
        transaction.objectStore("candidate-profile").delete("primary");
        transaction.oncomplete = resolve;
        transaction.onerror = () => reject(transaction.error);
      };
    }));
    // Reload after clearing IndexedDB so the import test cannot pass from stale React state.
    await page.reload({ waitUntil: "networkidle" });
    await page.getByRole("button", { name: "My profile" }).click();
    await page.getByRole("heading", { name: "My profile" }).waitFor();
    assert.equal(await page.getByLabel("Full name").inputValue(), "", "The profile should be empty after its IndexedDB record is removed.");
    assert.equal(await page.getByText("candidate-resume.pdf").count(), 0, "The removed resume should no longer appear.");

    const backupPath = await profileBackupDownload.path();
    const importInput = page.locator('input[type="file"][accept=".json,application/json"]');
    const importedDialog = await performWithDialog(
      page,
      () => importInput.setInputFiles(backupPath),
      true,
    );
    assert.equal(importedDialog.type, "confirm");
    assert.match(importedDialog.message, /Replace the profile currently in this browser/);
    await page.waitForFunction(() => {
      const label = Array.from(document.querySelectorAll("label"))
        .find((item) => item.textContent?.trim() === "Full name");
      return label?.querySelector("input")?.value === "Test Candidate";
    });
    assert.equal(await page.getByLabel("Full name").inputValue(), "Test Candidate", "Import should restore the structured profile.");
    assert.equal(await page.getByText("candidate-resume.pdf").count(), 1, "Import should restore the original resume attachment.");
    const restoredCandidateProfile = await page.evaluate(() => new Promise((resolve, reject) => {
      const openRequest = indexedDB.open("game-industry-outreach-private", 1);
      openRequest.onerror = () => reject(openRequest.error);
      openRequest.onsuccess = () => {
        const transaction = openRequest.result.transaction("candidate-profile", "readonly");
        const request = transaction.objectStore("candidate-profile").get("primary");
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result?.profile);
      };
    }));
    assert.equal(
      restoredCandidateProfile.materials.masterResume.dataBase64,
      savedCandidateProfile.materials.masterResume.dataBase64,
      "Backup import should restore the exact original document bytes.",
    );

    // Matches are generated locally from the restored profile and the public studio directory.
    await page.getByRole("button", { name: "Matches", exact: true }).click();
    await page.getByRole("heading", { name: "Your matches" }).waitFor();
    const matchCards = page.locator(".match-card");
    const matchCount = await matchCards.count();
    assert.ok(matchCount > 100, "The matching page should assess the active public studio routes.");
    assert.ok(await page.getByText(/Professional relevance, application-route readiness and personal priority are assessed separately/).count());
    await page.locator("#matching-relevance-filter").selectOption("potential");
    assert.ok(await matchCards.count() > 0, "Potential matches should remain visible for general and transferable routes.");
    await page.locator("#matching-relevance-filter").selectOption("all");
    await matchCards.first().getByRole("button", { name: "View assessment details" }).click();
    await page.getByRole("heading", { name: "Application route and instructions" }).waitFor();
    await page.getByText(/Confirm the employer's latest instructions/).waitFor();
    await page.getByRole("button", { name: "Studios", exact: true }).click();
    await page.getByRole("heading", { name: "Studio directory" }).waitFor();

    await page.getByRole("button", { name: "Switch to dark theme" }).click();
    assert.equal(await page.locator("html").getAttribute("data-bs-theme"), "dark");
    await page.reload({ waitUntil: "networkidle" });
    assert.equal(await page.locator("html").getAttribute("data-bs-theme"), "dark", "Theme choice should persist.");
    await page.getByRole("button", { name: "Switch to light theme" }).click();
    assert.equal(await page.locator("html").getAttribute("data-bs-theme"), "light");

    const rows = page.locator(".studio-data-row");
    const initialCount = await rows.count();
    assert.ok(initialCount > 100, "The global directory should contain a substantial set of active studios.");
    assert.ok(await page.locator(".studio-mark").count() > 100, "Studio marks should appear for directory rows.");
    assert.ok(await page.locator(".country-flag").count() > 100, "Known studio locations should display flags.");
    assert.deepEqual(
      await page.locator(".studio-table thead th").evaluateAll(headers => headers.map(header =>
        header.querySelector(".column-sort-button span:first-child")?.textContent?.trim() || header.textContent?.trim()
      )),
      ["Studio", "Studio location", "Notable work", "Studio type", "Tracker"],
      "The main table should keep only general studio information and the tracker action.",
    );
    assert.equal(
      await rows.first().locator("td").count(),
      5,
      "Every studio data row should have exactly five cells to match the simplified header.",
    );
    await page.getByLabel("Show only studios added in the last 24 hours").check();
    assert.equal(await rows.count(), 5, "Only the five recently published closeout studios should appear.");
    assert.equal(await page.getByText("NEW", { exact: true }).count(), 5);
    await page.getByRole("button", { name: "Reset filters" }).click();
    assert.equal(await rows.count(), initialCount, "Reset filters should restore the full directory.");

    // Search and empty-state recovery.
    await page.getByLabel("Search", { exact: true }).fill("no-studio-with-this-name-9345");
    await page.getByText("No studios match these filters.").waitFor();
    await page.getByRole("button", { name: "Reset filters" }).click();
    assert.equal(await rows.count(), initialCount, "Clearing filters should restore the directory.");

    await page.getByLabel("Search", { exact: true }).fill("4A Games");
    assert.equal(await rows.count(), 1, "A matching studio search should return the intended studio.");
    await rows.getByText("4A Games").waitFor();
    const fourARow = rows.filter({ hasText: "4A Games" });
    await fourARow.getByRole("button", { name: "4A Games" }).click();
    const fourAPosters = page.locator(".game-poster-grid .game-poster-card");
    assert.equal(await fourAPosters.count(), 2, "Expanded studio profiles should render one poster card per notable game.");
    assert.deepEqual(
      await fourAPosters.evaluateAll(cards => cards.map(card => card.getAttribute("data-game-title"))),
      ["Metro Exodus", "Metro: Last Light Redux"],
    );
    assert.ok(
      await page.locator(".game-poster-grid img").count() > 0,
      "Listed games should render cover artwork images.",
    );
    const metroExodusPoster = page.locator('.game-poster-grid .game-poster-card[data-game-title="Metro Exodus"]');
    const metroExodusImage = metroExodusPoster.locator('img[data-artwork-source="IGDB"]');
    await metroExodusImage.waitFor();
    assert.ok(
      (await metroExodusImage.getAttribute("src") || "").includes("/coaroh.jpg"),
      "When a game has both IGDB and Steam artwork, the IGDB cover should be displayed first.",
    );
    await fourARow.getByRole("button", { name: "4A Games" }).click();
    await page.getByLabel("Search", { exact: true }).fill("");
    assert.equal(await rows.count(), initialCount, "Clearing a successful search should restore the directory.");

    // Continent, country and work-model filters must narrow the visible result set.
    const continent = page.getByLabel("Continent");
    const continentValues = await continent.locator("option").evaluateAll((options) =>
      options.map((option) => option.value),
    );
    assert.ok(continentValues.includes("Europe"), "The continent filter should include Europe.");
    assert.ok(continentValues.includes("Asia"), "The continent filter should include Asia.");
    assert.ok(continentValues.includes("Africa"), "The continent filter should include Africa.");
    await continent.selectOption("Europe");
    const europeRows = await rows.count();
    assert.ok(europeRows > 0 && europeRows < initialCount, "Europe filtering should narrow the directory.");
    assert.equal(
      await rows.evaluateAll((tableRows) => tableRows.every((row) => (row.getAttribute("data-continents") || "").split("|").includes("Europe"))),
      true,
      "Every row shown by the Europe filter should have a European headquarters.",
    );
    await continent.selectOption("All continents");

    const country = page.getByLabel("Country");
    const countryValues = await country.locator("option").evaluateAll((options) =>
      options.map((option) => option.value),
    );
    const firstCountry = countryValues.find((value) => value !== "All countries");
    assert.ok(firstCountry, "The country filter should contain real countries.");
    await country.selectOption(firstCountry);
    const countryCount = await rows.count();
    assert.ok(countryCount > 0 && countryCount < initialCount, "Country filtering should narrow the directory.");
    await country.selectOption("All countries");

    await page.locator(".directory-toolbar").getByLabel("Work model").selectOption("remote");
    const remoteCount = await rows.count();
    assert.ok(remoteCount > 0 && remoteCount < initialCount, "Work-model filtering should narrow the directory.");
    await page.locator(".directory-toolbar").getByLabel("Work model").selectOption("All work models");
    await page.getByLabel("Search", { exact: true }).fill("Laki Studios");
    await country.selectOption("Poland");
    await page.getByRole("button", { name: "Reset filters" }).click();
    assert.equal(await rows.count(), initialCount, "Reset filters should clear search and selects.");

    // Column headers sort the table and expose the active sort direction accessibly.
    const locationHeader = page.getByRole("button", { name: /Sort by Studio location/ });
    await locationHeader.click();
    assert.equal(await locationHeader.locator("xpath=..").getAttribute("aria-sort"), "ascending");
    const locationsAreSorted = await rows.evaluateAll((tableRows) => {
      const collator = new Intl.Collator(undefined, { sensitivity: "base", numeric: true });
      const values = tableRows.map((row) => ({
        name: row.querySelector(".studio-name")?.textContent?.trim() || "",
        location: row.cells[1]?.textContent?.trim() || "",
      }));
      return values.every((current, index) => {
        if (index === 0) return true;
        const previous = values[index - 1];
        const locationOrder = collator.compare(previous.location, current.location);
        return locationOrder < 0 || (locationOrder === 0 && collator.compare(previous.name, current.name) <= 0);
      });
    });
    assert.equal(locationsAreSorted, true, "Location header sorting should follow displayed location and studio-name order.");
    await locationHeader.click();
    assert.equal(await locationHeader.locator("xpath=..").getAttribute("aria-sort"), "descending");
    await page.getByRole("button", { name: /Sort by Studio \(ascending\)/ }).click();

    // Rows expand into a concise studio profile with up to four notable titles.
    const fourAGamesRow = rows.filter({ hasText: "4A Games" });
    assert.deepEqual(
      await fourAGamesRow.locator(".popular-game-cover").evaluateAll(covers =>
        covers.map(cover => cover.getAttribute("data-game-title")),
      ),
      ["Metro Exodus", "Metro: Last Light Redux"],
      "The compact studio table should show thumbnails for its notable games.",
    );
    await fourAGamesRow.locator("td").nth(3).click();
    const fourAGamesDetails = page.locator("#studio-details-4a-games");
    await fourAGamesDetails.waitFor();
    assert.match(await fourAGamesDetails.textContent(), /About the studio/);
    assert.match(await fourAGamesDetails.textContent(), /Metro Exodus/);
    assert.match(await fourAGamesDetails.textContent(), /Studio type/);
    assert.match(await fourAGamesDetails.textContent(), /Industry scale/);
    assert.match(await fourAGamesDetails.textContent(), /Team size/);
    assert.match(await fourAGamesDetails.textContent(), /Headquarters/);
    assert.match(await fourAGamesDetails.textContent(), /Platforms and focus/);
    assert.match(await fourAGamesDetails.textContent(), /Application route/);
    assert.doesNotMatch(await fourAGamesDetails.textContent(), /Application route notes|Listed hiring locations|Listed disciplines|Route last checked:/);
    const fullWidthDetails = await fourAGamesDetails.locator("td").evaluate(cell => ({
      colSpan: cell.colSpan,
      cellWidth: cell.getBoundingClientRect().width,
      tableWidth: cell.closest("table").getBoundingClientRect().width,
    }));
    assert.equal(fullWidthDetails.colSpan, 5);
    assert.ok(fullWidthDetails.cellWidth >= fullWidthDetails.tableWidth - 2, "The expanded profile should span the entire table width.");
    const applicationLink = fourAGamesDetails.getByRole("link", { name: "Application route" });
    assert.equal(await applicationLink.getAttribute("href"), "https://www.4a-games.com.mt/other-cv");
    assert.equal(await applicationLink.getAttribute("target"), "_blank");
    assert.match(await applicationLink.getAttribute("rel") || "", /noopener/);
    const websiteLink = fourAGamesDetails.getByRole("link", { name: "Website" });
    assert.equal(await websiteLink.getAttribute("href"), "https://www.4a-games.com.mt/");
    await fourAGamesRow.getByRole("button", { name: /4A Games/ }).click();
    await fourAGamesDetails.waitFor({ state: "detached" });

    // Curated official social/storefront links appear with named labels in the expanded overview.
    const asoboRow = rows.filter({ hasText: "Asobo Studio" });
    await asoboRow.getByRole("button", { name: /Asobo Studio/ }).click();
    const asoboDetails = page.locator("#studio-details-asobo-studio");
    await asoboDetails.waitFor();
    const linkedinLink = asoboDetails.getByRole("link", { name: "LinkedIn" });
    assert.equal(await linkedinLink.getAttribute("href"), "https://www.linkedin.com/company/asobo-studio/");
    assert.equal(await linkedinLink.getAttribute("target"), "_blank");
    assert.match(await linkedinLink.getAttribute("rel") || "", /noopener/);
    await asoboRow.getByRole("button", { name: /Asobo Studio/ }).click();
    await asoboDetails.waitFor({ state: "detached" });

    // IGDB artwork wins over Steam when both are present (the Stuck Together example).
    const hugecalfRow = rows.filter({ hasText: "Hugecalf Studios" });
    await hugecalfRow.getByRole("button", { name: /Hugecalf Studios/ }).click();
    const hugecalfDetails = page.locator("#studio-details-hugecalf-studios");
    await hugecalfDetails.waitFor();
    const stuckTogetherPoster = hugecalfDetails.locator('.game-poster-card[data-game-title="Stuck Together"]');
    const stuckTogetherImage = stuckTogetherPoster.locator('img[data-artwork-source="IGDB"]');
    await stuckTogetherImage.waitFor();
    assert.equal(
      await stuckTogetherImage.getAttribute("src"),
      "https://images.igdb.com/igdb/image/upload/t_cover_big/coa9za.webp",
      "Stuck Together should display the exact IGDB cover supplied for this example.",
    );
    assert.equal(await stuckTogetherPoster.getAttribute("href"), "https://store.steampowered.com/app/3295360/");
    await hugecalfRow.getByRole("button", { name: /Hugecalf Studios/ }).click();
    await hugecalfDetails.waitFor({ state: "detached" });

    // A landscape Steam header must receive a landscape-sized frame in both the table and expanded gallery.
    const twentyTwoCansRow = rows.filter({ hasText: "22cans" });
    await twentyTwoCansRow.getByRole("button", { name: /22cans/ }).click();
    const trailTableCover = twentyTwoCansRow.locator('.popular-game-cover[data-game-title="The Trail"]');
    const trailTableImage = trailTableCover.locator('img[data-artwork-layout="landscape"]');
    await trailTableImage.waitFor();
    const trailTableImageUrl = await trailTableImage.getAttribute("src") || "";
    const trailArtworkPath = new URL(trailTableImageUrl).pathname;
    assert.ok(
      trailArtworkPath.includes("/steam/apps/3544920/") && trailArtworkPath.endsWith("/header.jpg"),
      "The Trail should fall back to its verified landscape Steam header after portrait artwork fails. Actual URL: " + trailTableImageUrl,
    );
    const compactRatio = await trailTableCover.evaluate(element => {
      const rect = element.getBoundingClientRect();
      return rect.width / rect.height;
    });
    assert.ok(compactRatio > 1.8, "The compact table thumbnail should expand horizontally for landscape artwork.");

    const twentyTwoCansButton = twentyTwoCansRow.getByRole("button", { name: /22cans/ });
    const twentyTwoCansDetails = page.locator("#studio-details-22cans");
    await twentyTwoCansDetails.waitFor();
    const trailPoster = page.locator('.game-poster-grid .game-poster-card[data-game-title="The Trail"]');
    const trailPosterImage = trailPoster.locator('img[data-artwork-layout="landscape"]');
    await trailPosterImage.waitFor();
    const posterRatio = await trailPoster.locator(".game-poster-art").evaluate(element => {
      const rect = element.getBoundingClientRect();
      return rect.width / rect.height;
    });
    assert.ok(
      posterRatio > 1.8 && posterRatio < 2.3,
      "The expanded poster frame itself should be landscape-shaped, rather than a portrait frame containing a wide image.",
    );
    await twentyTwoCansButton.click();
    await twentyTwoCansDetails.waitFor({ state: "detached" });

    // Official website artwork must work as a real fallback and link to the game's own page.
    const d4nRow = rows.filter({ hasText: "D4N Games" });
    await d4nRow.getByRole("button", { name: /D4N Games/ }).click();
    const d4nDetails = page.locator("#studio-details-d4n-games");
    await d4nDetails.waitFor();
    const tabletPoster = d4nDetails.locator('.game-poster-card[data-game-title="The Tablet of Destinies"]');
    const tabletImage = tabletPoster.locator('img[data-artwork-source="Official site"]');
    await tabletImage.waitFor();
    assert.ok(
      (await tabletImage.getAttribute("src") || "").endsWith("/images/tablet_thumbnail.webp"),
      "The Tablet of Destinies should use the image hosted on D4N Games' official website.",
    );
    assert.equal(
      await tabletPoster.getAttribute("href"),
      "https://www.d4ngames.com/games/tablet-of-destinies",
      "The Tablet of Destinies should link directly to its official game page.",
    );
    const tabletRatio = await tabletPoster.locator(".game-poster-art").evaluate(element => {
      const rect = element.getBoundingClientRect();
      return rect.width / rect.height;
    });
    assert.ok(tabletRatio > 1.8, "The official Tablet of Destinies artwork should use a landscape frame.");
    await d4nRow.getByRole("button", { name: /D4N Games/ }).click();
    await d4nDetails.waitFor({ state: "detached" });

    // Square mobile-app art from a studio website should not be forced into portrait or landscape frames.
    const ahoiiiRow = rows.filter({ hasText: "Ahoiii Entertainment" });
    await ahoiiiRow.getByRole("button", { name: /Ahoiii Entertainment/ }).click();
    const ahoiiiDetails = page.locator("#studio-details-ahoiii-entertainment");
    await ahoiiiDetails.waitFor();
    const fietePoster = ahoiiiDetails.locator('.game-poster-card[data-game-title="Fiete World"]');
    const fieteImage = fietePoster.locator('img[data-artwork-source="Official site"][data-artwork-layout="square"]');
    await fieteImage.waitFor();
    assert.ok(
      (await fieteImage.getAttribute("src") || "").endsWith("FieteWorldKids-Games-Apps-180x180-2.png"),
      "Fiete World should use the official Ahoiii app artwork.",
    );
    const fieteRatio = await fietePoster.locator(".game-poster-art").evaluate(element => {
      const rect = element.getBoundingClientRect();
      return rect.width / rect.height;
    });
    assert.ok(fieteRatio > 0.9 && fieteRatio < 1.1, "Official square app artwork should receive a square frame.");
    await ahoiiiRow.getByRole("button", { name: /Ahoiii Entertainment/ }).click();
    await ahoiiiDetails.waitFor({ state: "detached" });

    // IGDB images are a live fallback source, and games still link to their exact IGDB page.
    const ocellusRow = rows.filter({ hasText: "Ocellus" });
    await ocellusRow.getByRole("button", { name: /Ocellus/ }).click();
    const ocellusDetails = page.locator("#studio-details-ocellus");
    await ocellusDetails.waitFor();
    const clashPoster = ocellusDetails.locator('.game-poster-card[data-game-title="Clash Royale"]').first();
    const clashImage = clashPoster.locator('img[data-artwork-source="IGDB"]');
    await clashImage.waitFor();
    assert.ok(
      (await clashImage.getAttribute("src") || "").includes("images.igdb.com/igdb/image/upload/"),
      "IGDB artwork URLs should be available under the site's Content Security Policy.",
    );
    assert.equal(
      await clashPoster.getAttribute("href"),
      "https://www.igdb.com/games/clash-royale",
      "IGDB-backed games should use their direct page, not a generic Steam search.",
    );
    await ocellusRow.getByRole("button", { name: /Ocellus/ }).click();
    await ocellusDetails.waitFor({ state: "detached" });

    // App Store art is a final fallback when earlier cover sources are absent.
    const halfbrickRow = rows.filter({ hasText: "Halfbrick Studios" });
    await halfbrickRow.getByRole("button", { name: /Halfbrick Studios/ }).click();
    const halfbrickDetails = page.locator("#studio-details-halfbrick-studios");
    await halfbrickDetails.waitFor();
    const fruitNinjaPoster = halfbrickDetails.locator('.game-poster-card[data-game-title="Fruit Ninja"]').first();
    const fruitNinjaImage = fruitNinjaPoster.locator('img[data-artwork-source="App Store"][data-artwork-layout="square"]');
    await fruitNinjaImage.waitFor();
    assert.ok((await fruitNinjaImage.getAttribute("src") || "").includes("mzstatic.com/image/thumb/"));
    assert.equal(await fruitNinjaPoster.getAttribute("href"), "https://apps.apple.com/us/app/fruit-ninja/id403858572?uo=4");
    const fruitNinjaRatio = await fruitNinjaPoster.locator(".game-poster-art").evaluate(element => {
      const rect = element.getBoundingClientRect();
      return rect.width / rect.height;
    });
    assert.ok(fruitNinjaRatio > 0.9 && fruitNinjaRatio < 1.1);
    await halfbrickRow.getByRole("button", { name: /Halfbrick Studios/ }).click();
    await halfbrickDetails.waitFor({ state: "detached" });

    assert.equal(
      await page.locator('.game-poster-card[href*="store.steampowered.com/search/"], .popular-game-cover[href*="store.steampowered.com/search/"]').count(),
      0,
      "Game artwork cards must not fall back to generic Steam search URLs.",
    );

    // Saving, browser-local persistence and refresh.
    const studioRow = page.getByRole("row").filter({ hasText: "4A Games" });
    assert.equal(await studioRow.count(), 1, "The test studio should appear exactly once.");
    await studioRow.getByRole("button", { name: "Save" }).click();
    await studioRow.getByRole("button", { name: "In tracker" }).waitFor();

    const storedBeforeReload = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) || "[]"), storageKey);
    assert.equal(storedBeforeReload.length, 1);
    assert.equal(storedBeforeReload[0].studioName, "4A Games");
    assert.equal(storedBeforeReload[0].countryCode, "MT", "The headquarters country code should be retained locally.");

    await page.reload({ waitUntil: "networkidle" });
    await page.getByRole("button", { name: /My applications/ }).click();
    await page.getByRole("heading", { name: "My applications" }).waitFor();

    let trackedRow = page.locator(".tracker-table tbody tr").filter({ has: page.locator(".status-select-label") }).filter({ hasText: "4A Games" });
    assert.equal(await trackedRow.count(), 1, "A saved studio should survive a full page reload.");
    let status = page.getByLabel("Status for 4A Games");
    assert.equal(await status.inputValue(), "saved");

    // Editable notes, note search and browser-local persistence.
    const notesButton = trackedRow.getByRole("button", { name: "Edit notes for 4A Games" });
    await notesButton.click();
    const notesInput = page.getByLabel("Application notes · 4A Games");
    const savedNote = "Submitted via the studio careers portal; follow up next Tuesday.";
    await notesInput.fill(savedNote);
    await page.getByLabel("Search tracker").fill("follow up next Tuesday");
    assert.equal(await trackedRow.count(), 1, "Tracker search should include application notes.");
    await page.getByLabel("Search tracker").fill("");
    await page.reload({ waitUntil: "networkidle" });
    await page.getByRole("button", { name: /My applications/ }).click();
    trackedRow = page.locator(".tracker-table tbody tr").filter({ has: page.locator(".status-select-label") }).filter({ hasText: "4A Games" });
    assert.equal(await trackedRow.count(), 1, "The saved studio should remain after reload.");
    await trackedRow.getByRole("button", { name: "Edit notes for 4A Games" }).click();
    assert.equal(await page.getByLabel("Application notes · 4A Games").inputValue(), savedNote, "Application notes should persist after reload.");
    status = page.getByLabel("Status for 4A Games");

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
    assert.notEqual((await trackedRow.locator(".applied-date").textContent())?.trim(), "—", "The tracker should display the application submission date.");
    await status.selectOption("interview");

    await page.getByRole("tab", { name: /Interview/ }).click();
    status = page.getByLabel("Status for 4A Games");
    await status.selectOption("offer");

    await page.getByRole("tab", { name: /Offer/ }).click();
    status = page.getByLabel("Status for 4A Games");
    await status.selectOption("archived");

    await page.getByRole("tab", { name: /Archived/ }).click();
    trackedRow = page.locator(".tracker-table tbody tr").filter({ has: page.locator(".status-select-label") }).filter({ hasText: "4A Games" });
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
      "Browser acceptance passed: directory filters/sorting/links, save and reload persistence, all tracker statuses, applied-date tracking, editable/searchable/persistent notes, confirmation dialogs, removal, local-only storage, and desktop/mobile overflow checks.\n",
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
