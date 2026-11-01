#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = process.cwd();
const profilesPath = path.join(root, "src/data/studio-profiles.json");
const PLATFORM_ORDER = ["PC", "Console", "Mobile", "VR", "XR", "Web"];
const platformMatchers = [
  [/\b(pc|desktop|mac|linux)\b/i, "PC"],
  [/\b(console|playstation|xbox|nintendo)\b/i, "Console"],
  [/\b(mobile|ios|android)\b/i, "Mobile"],
  [/\b(vr|virtual reality|meta quest)\b/i, "VR"],
  [/\b(xr|ar|mr|mixed reality|augmented reality)\b/i, "XR"],
  [/\b(web|browser|html5)\b/i, "Web"],
];
const focusAliases = {
  "action": [
    "Action"
  ],
  "action rpg": [
    "Action",
    "RPG"
  ],
  "action-adventure": [
    "Action",
    "Adventure"
  ],
  "action adventure": [
    "Action",
    "Adventure"
  ],
  "adventure": [
    "Adventure"
  ],
  "3d adventure": [
    "Adventure"
  ],
  "narrative adventure": [
    "Adventure",
    "Narrative"
  ],
  "puzzle adventure": [
    "Puzzle",
    "Adventure"
  ],
  "arcade": [
    "Arcade"
  ],
  "instant games": [
    "Arcade"
  ],
  "rhythm": [
    "Arcade"
  ],
  "card battler": [
    "Card games"
  ],
  "collectible card game": [
    "Card games"
  ],
  "collectible card games": [
    "Card games"
  ],
  "digital card games": [
    "Card games"
  ],
  "deckbuilder": [
    "Card games"
  ],
  "casual": [
    "Casual"
  ],
  "casual games": [
    "Casual"
  ],
  "board and casual games": [
    "Casual"
  ],
  "hybrid-casual": [
    "Casual"
  ],
  "hyper-casual": [
    "Casual"
  ],
  "hyper-casual games": [
    "Casual"
  ],
  "hypercasual": [
    "Casual"
  ],
  "short-session games": [
    "Casual"
  ],
  "idle": [
    "Casual",
    "Management"
  ],
  "idle games": [
    "Casual",
    "Management"
  ],
  "merge": [
    "Casual",
    "Puzzle"
  ],
  "merge-3": [
    "Casual",
    "Puzzle"
  ],
  "co-op": [
    "Co-op"
  ],
  "co-operative multiplayer": [
    "Co-op",
    "Multiplayer"
  ],
  "cooperative games": [
    "Co-op"
  ],
  "cooperative multiplayer": [
    "Co-op",
    "Multiplayer"
  ],
  "fighting": [
    "Fighting"
  ],
  "platform fighter": [
    "Fighting",
    "Platformer"
  ],
  "fantasy": [
    "Fantasy"
  ],
  "dark fantasy": [
    "Fantasy"
  ],
  "family": [
    "Family-friendly"
  ],
  "family games": [
    "Family-friendly"
  ],
  "children and family games": [
    "Family-friendly"
  ],
  "family-friendly": [
    "Family-friendly"
  ],
  "historical": [
    "Historical"
  ],
  "historical fiction": [
    "Historical"
  ],
  "history": [
    "Historical"
  ],
  "world war ii": [
    "Historical"
  ],
  "horror": [
    "Horror"
  ],
  "survival horror": [
    "Horror",
    "Survival"
  ],
  "management": [
    "Management"
  ],
  "football management": [
    "Management",
    "Sports"
  ],
  "sports management": [
    "Management",
    "Sports"
  ],
  "time management": [
    "Management"
  ],
  "tycoon": [
    "Management",
    "Simulation"
  ],
  "city builder": [
    "Management",
    "Simulation"
  ],
  "factory automation": [
    "Management",
    "Simulation"
  ],
  "management simulation": [
    "Management",
    "Simulation"
  ],
  "multiplayer": [
    "Multiplayer"
  ],
  "online multiplayer": [
    "Multiplayer"
  ],
  "competitive multiplayer": [
    "Multiplayer"
  ],
  "competitive pvp": [
    "Multiplayer"
  ],
  "pvp": [
    "Multiplayer"
  ],
  "pvevp": [
    "Multiplayer"
  ],
  "online": [
    "Multiplayer"
  ],
  "online games": [
    "Multiplayer"
  ],
  "online strategy": [
    "Multiplayer",
    "Strategy"
  ],
  "real-time multiplayer": [
    "Multiplayer"
  ],
  "mmo": [
    "MMO",
    "Multiplayer"
  ],
  "mmorpg": [
    "MMO",
    "RPG",
    "Multiplayer"
  ],
  "narrative": [
    "Narrative"
  ],
  "narrative games": [
    "Narrative"
  ],
  "story-driven games": [
    "Narrative"
  ],
  "storytelling": [
    "Narrative"
  ],
  "emotional storytelling": [
    "Narrative"
  ],
  "world-building": [
    "Narrative"
  ],
  "open world": [
    "Open world"
  ],
  "open-world": [
    "Open world"
  ],
  "open-world survival": [
    "Open world",
    "Survival"
  ],
  "platformer": [
    "Platformer"
  ],
  "3d platformer": [
    "Platformer"
  ],
  "collectathon": [
    "Platformer",
    "Adventure"
  ],
  "puzzle": [
    "Puzzle"
  ],
  "hidden object": [
    "Puzzle"
  ],
  "quiz": [
    "Puzzle"
  ],
  "word games": [
    "Puzzle"
  ],
  "racing": [
    "Racing"
  ],
  "rpg": [
    "RPG"
  ],
  "role-playing games": [
    "RPG"
  ],
  "turn-based rpg": [
    "RPG",
    "Strategy"
  ],
  "roguelite": [
    "Roguelike"
  ],
  "survivor-like": [
    "Roguelike",
    "Action"
  ],
  "sandbox": [
    "Sandbox"
  ],
  "survival sandbox": [
    "Sandbox",
    "Survival"
  ],
  "science fiction": [
    "Sci-fi"
  ],
  "cyberpunk": [
    "Sci-fi"
  ],
  "space": [
    "Sci-fi"
  ],
  "shooter": [
    "Shooter"
  ],
  "fps": [
    "Shooter"
  ],
  "first-person shooter": [
    "Shooter"
  ],
  "first person shooter": [
    "Shooter"
  ],
  "first-person": [
    "Shooter"
  ],
  "2d shooter": [
    "Shooter"
  ],
  "tactical fps": [
    "Shooter",
    "Tactical"
  ],
  "simulation": [
    "Simulation"
  ],
  "god game": [
    "Simulation"
  ],
  "sports simulation": [
    "Simulation",
    "Sports"
  ],
  "vehicle simulation": [
    "Simulation"
  ],
  "sports": [
    "Sports"
  ],
  "football": [
    "Sports"
  ],
  "baseball": [
    "Sports"
  ],
  "hockey": [
    "Sports"
  ],
  "volleyball": [
    "Sports"
  ],
  "esports": [
    "Sports"
  ],
  "stealth": [
    "Stealth"
  ],
  "strategy": [
    "Strategy"
  ],
  "rts": [
    "Strategy"
  ],
  "tactics": [
    "Strategy",
    "Tactical"
  ],
  "wargame": [
    "Strategy",
    "Tactical"
  ],
  "turn-based strategy": [
    "Strategy",
    "Tactical"
  ],
  "tower defense": [
    "Strategy"
  ],
  "auto-battler": [
    "Strategy"
  ],
  "survival": [
    "Survival"
  ],
  "serious games": [
    "Serious games"
  ],
  "educational and learning games": [
    "Serious games"
  ],
  "social games": [
    "Social games"
  ],
  "social deduction": [
    "Social games"
  ],
  "community-oriented games": [
    "Social games"
  ]
};
const normalizeToken = value => String(value).toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, " ").trim().replace(/\s+/g, " ");
const focusAliasesNormalized = new Map(Object.entries(focusAliases).map(([key, values]) => [normalizeToken(key), values]));

export function normalizeScale(value) {
  const source = String(value || "");
  if (/\b(ambition|aspirational|not yet assessed|not classified|not disclosed|not publicly disclosed|mixed|unclassified)\b/i.test(source)) return null;
  const matches = ["AAA", "AA", "Indie"].filter(label => new RegExp("\\b" + label + "\\b", "i").test(source));
  return matches.length === 1 ? matches[0] : null;
}

export function normalizeStudioProfileTags(profile) {
  const sourceTokens = [...(profile.focus || []), ...(profile.companyType || [])];
  const platforms = new Set();
  for (const value of sourceTokens) {
    for (const [matcher, label] of platformMatchers) if (matcher.test(String(value))) platforms.add(label);
  }
  const gameFocus = new Set();
  for (const value of profile.focus || []) {
    for (const label of focusAliasesNormalized.get(normalizeToken(value)) || []) gameFocus.add(label);
  }
  const typeText = (profile.companyType || []).join(" ").toLowerCase();
  const studioRoles = [];
  if (/\bdeveloper\b/.test(typeText)) studioRoles.push("Developer");
  if (/\bpublisher|publishing\b/.test(typeText)) studioRoles.push("Publisher");
  if (/co[ -]?development|co[ -]?dev/.test(typeText)) studioRoles.push("Co-dev");

  const scale = normalizeScale(profile.industryScale);
  const updated = {
    ...profile,
    platforms: PLATFORM_ORDER.filter(value => platforms.has(value)),
    gameFocus: [...gameFocus],
    studioRoles,
  };
  if (scale) {
    updated.scale = scale;
    updated.scaleBasis = /editorial indication/i.test(profile.industryScale) ? "editorial" : "recorded";
  } else {
    delete updated.scale;
    delete updated.scaleBasis;
  }
  return updated;
}

export function normalizeStudioProfiles(profiles) {
  return Object.fromEntries(Object.entries(profiles).map(([name, profile]) => [name, normalizeStudioProfileTags(profile)]));
}

function main() {
  const profiles = JSON.parse(readFileSync(profilesPath, "utf8"));
  const updated = normalizeStudioProfiles(profiles);
  const write = process.argv.includes("--write");
  if (write) writeFileSync(profilesPath, JSON.stringify(updated, null, 2) + "\n", "utf8");
  const counts = { studios: Object.keys(updated).length, scales: {}, platforms: {}, gameFocus: {}, studioRoles: {} };
  for (const profile of Object.values(updated)) {
    if (profile.scale) counts.scales[profile.scale] = (counts.scales[profile.scale] || 0) + 1;
    for (const value of profile.platforms) counts.platforms[value] = (counts.platforms[value] || 0) + 1;
    for (const value of profile.gameFocus) counts.gameFocus[value] = (counts.gameFocus[value] || 0) + 1;
    for (const value of profile.studioRoles) counts.studioRoles[value] = (counts.studioRoles[value] || 0) + 1;
  }
  process.stdout.write(JSON.stringify({ ...counts, mode: write ? "written" : "dry-run" }, null, 2) + "\n");
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
