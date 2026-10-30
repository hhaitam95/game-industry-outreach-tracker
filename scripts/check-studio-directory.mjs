import { readFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const studiosPath = path.join(root, "src/data/speculative-route-directory.json");
const profilesPath = path.join(root, "src/data/studio-profiles.json");

function readJson(filePath) {
  try {
    return JSON.parse(readFileSync(filePath, "utf8"));
  } catch (error) {
    throw new Error("Could not read valid JSON from " + path.relative(root, filePath) + ".", { cause: error });
  }
}

function requiredText(value, label) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(label + " must be a non-empty string.");
  }
}

function httpsUrl(value, label) {
  requiredText(value, label);
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error(label + " must be a valid URL.");
  }
  if (url.protocol !== "https:" || !url.hostname || url.username || url.password) {
    throw new Error(label + " must be HTTPS and must not contain embedded credentials.");
  }
}

const studios = readJson(studiosPath);
const profiles = readJson(profilesPath);
const errors = [];

if (!Array.isArray(studios)) errors.push("Studio directory must be a JSON array.");
if (!profiles || typeof profiles !== "object" || Array.isArray(profiles)) errors.push("Studio profiles must be a JSON object.");

if (Array.isArray(studios) && profiles && typeof profiles === "object" && !Array.isArray(profiles)) {
  const names = new Set();

  for (const [index, studio] of studios.entries()) {
    const row = "Studio row " + (index + 1);
    if (!studio || typeof studio !== "object" || Array.isArray(studio)) {
      errors.push(row + " must be an object.");
      continue;
    }

    for (const field of ["name", "country", "notes", "checkedAt"]) {
      try { requiredText(studio[field], row + "." + field); }
      catch (error) { errors.push(error.message); }
    }
    for (const field of ["websiteUrl", "applicationUrl", "evidenceUrl"]) {
      try { httpsUrl(studio[field], row + "." + field); }
      catch (error) { errors.push(error.message); }
    }
    if (typeof studio.checkedAt === "string" && !/^\d{4}-\d{2}-\d{2}$/.test(studio.checkedAt)) {
      errors.push(row + ".checkedAt must use YYYY-MM-DD.");
    }

    const key = typeof studio.name === "string" ? studio.name.toLowerCase() : "";
    if (key && names.has(key)) errors.push("Duplicate studio name: " + studio.name + ".");
    if (key) names.add(key);

    if (studio.name === "3Sigma Studios" || studio.name === "Ballistic Moon") {
      errors.push("Excluded studio must not appear in the public directory: " + studio.name + ".");
    }

    const profile = profiles[studio.name];
    if (!profile || typeof profile !== "object" || Array.isArray(profile)) {
      errors.push("Missing profile for " + studio.name + ".");
      continue;
    }

    for (const field of ["description", "ownership", "industryScale", "teamSize"]) {
      try { requiredText(profile[field], studio.name + ".profile." + field); }
      catch (error) { errors.push(error.message); }
    }
    if (!profile.headquarters || typeof profile.headquarters !== "object") {
      errors.push(studio.name + ".profile.headquarters must be present, even when location is unknown.");
    } else {
      requiredText(profile.headquarters.country, studio.name + ".profile.headquarters.country");
      requiredText(profile.headquarters.label, studio.name + ".profile.headquarters.label");
      if (typeof profile.headquarters.city !== "string" && profile.headquarters.city !== null) {
        errors.push(studio.name + ".profile.headquarters.city must be a string or null.");
      }
    }
    for (const field of ["companyType", "otherLocations", "focus", "popularGames", "profileSources"]) {
      if (!Array.isArray(profile[field])) errors.push(studio.name + ".profile." + field + " must be an array.");
    }
    if (Array.isArray(profile.companyType) && profile.companyType.length === 0) {
      errors.push(studio.name + ".profile.companyType must not be empty.");
    }
    if (Array.isArray(profile.profileSources) && profile.profileSources.length === 0) {
      errors.push(studio.name + ".profile.profileSources must include at least one source.");
    }
    if (Array.isArray(profile.profileSources)) {
      for (const [sourceIndex, source] of profile.profileSources.entries()) {
        try { httpsUrl(source, studio.name + ".profile.profileSources[" + sourceIndex + "]"); }
        catch (error) { errors.push(error.message); }
      }
    }
    if (Array.isArray(profile.popularGames)) {
      for (const [gameIndex, game] of profile.popularGames.entries()) {
        if (!game || typeof game.title !== "string" || !game.title.trim()) {
          errors.push(studio.name + ".profile.popularGames[" + gameIndex + "] needs a title.");
        }
        if (game?.appId !== null && game?.appId !== undefined && (!Number.isInteger(game.appId) || game.appId < 1)) {
          errors.push(studio.name + ".profile.popularGames[" + gameIndex + "].appId must be a positive integer or null.");
        }
      }
    }
  }

  for (const name of Object.keys(profiles)) {
    if (!names.has(name.toLowerCase())) errors.push("Orphan profile has no directory entry: " + name + ".");
  }
}

if (errors.length) {
  process.stderr.write("Studio directory validation failed:\n" + errors.map(error => "- " + error).join("\n") + "\n");
  process.exitCode = 1;
} else {
  process.stdout.write("Studio directory validation passed: " + studios.length + " studios have complete profile records and secure official links.\n");
}
