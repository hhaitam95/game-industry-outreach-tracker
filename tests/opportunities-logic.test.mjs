import assert from "node:assert/strict";
import test from "node:test";
import { IS_SYNTHETIC_SNAPSHOT, OPPORTUNITY_SNAPSHOT } from "../src/lib/opportunities/snapshot.mjs";
import { classifyRoleFamily, TARGET_ROLE_FAMILIES } from "../src/lib/opportunities/classify.mjs";
import { filterOpportunities } from "../src/lib/opportunities/filter.mjs";
import { getRoleFreshness, getSnapshotFreshness } from "../src/lib/opportunities/freshness.mjs";
import { parseTitle } from "../src/lib/opportunities/parse.mjs";

const SNAPSHOT_DATE = "2026-10-27T18:00:00Z";

const goldenTitles = [
  ["Player Support Specialist - Dublin, Ireland", "support", "player support"],
  ["Technical Support Engineer", "support", "technical support"],
  ["Developer Support Specialist", "support", "developer support"],
  ["Support Engineer", "support", "Support Engineer"],
  ["IT Support Technician", "support", "IT Support"],
  ["QA Engineer II", "qa-test", "QA Engineer"],
  ["Software QA Analyst", "qa-test", "QA Analyst"],
  ["Test Automation Engineer", "qa-test", "Test Automation"],
  ["Quality Assurance Specialist", "qa-test", "Quality Assurance"],
  ["Test Engineer", "qa-test", "Test Engineer"],
  ["Staff Software Engineer, Build Platforms", "build-release", "Build Platforms"],
  ["Build Systems Engineer", "build-release", "Build Systems"],
  ["Build Services Engineer", "build-release", "Build Services"],
  ["Build and Release Engineer", "build-release", "Build and Release"],
  ["Release Engineer", "build-release", "Release Engineer"],
  ["Principal Software Engineer - DevOps / Site Reliability Engineer", "devops-sre", "Site Reliability"],
  ["Site Reliability Engineer", "devops-sre", "Site Reliability"],
  ["DevOps Engineer", "devops-sre", "DevOps"],
  ["Platform Engineer", "devops-sre", "Platform Engineer"],
  ["Developer Experience Engineer", "tools-devex", "Developer Experience"],
  ["Developer Connections Engineer", "tools-devex", "Developer Connections"],
  ["Engine & Tools Programmer", "tools-devex", "Engine & Tools"],
  ["Technical Producer", "technical-production", "Technical Producer"],
  ["Technical Program Manager", "technical-production", "Technical Program Manager"],
  ["Game Designer", "other", "Game Designer"],
  ["Animator", "other", "Animator"],
  ["Recruiter", "unclassified", null],
  ["Revenue Accounting Manager", "unclassified", null],
  ["Senior Finance Partner", "unclassified", null],
  ["Senior Software Engineer", "unclassified", null],
  ["Operations Lead", "unclassified", null],
  ["Infrastructure Engineer", "unclassified", null],
  ["Tools", "unclassified", null],
];

test("golden title rules prioritize precise role-family phrases over generic team words", () => {
  for (const [title, expectedFamily, expectedPhrase] of goldenTitles) {
    const actual = classifyRoleFamily(title);
    assert.equal(actual.family, expectedFamily, title);
    assert.equal(actual.matchedPhrase, expectedPhrase, title);
  }
  assert.deepEqual(TARGET_ROLE_FAMILIES, ["support", "qa-test", "build-release", "devops-sre", "tools-devex"]);
});

test("every synthetic snapshot title receives deterministic classification and parsing", () => {
  assert.equal(IS_SYNTHETIC_SNAPSHOT, true);
  assert.equal(OPPORTUNITY_SNAPSHOT.opportunities.length, 8);
  for (const role of OPPORTUNITY_SNAPSHOT.opportunities) {
    assert.equal(typeof role.title, "string");
    assert.equal(parseTitle(role.title).provenance, "parsed from listing text");
    assert.ok(classifyRoleFamily(role.title).family);
  }
});

test("title parser normalizes US and Korea aliases and recognizes Singapore as a city-state", () => {
  assert.deepEqual(parseTitle("Engineer - Los Angeles, US").location, {
    city: "Los Angeles",
    country: "USA",
    label: "Los Angeles, USA",
  });
  assert.deepEqual(parseTitle("Engineer - Los Angeles, USA").location, {
    city: "Los Angeles",
    country: "USA",
    label: "Los Angeles, USA",
  });
  assert.deepEqual(parseTitle("QA Engineer - Seoul, Korea").location, {
    city: "Seoul",
    country: "South Korea",
    label: "Seoul, South Korea",
  });
  assert.deepEqual(parseTitle("QA Engineer - Seoul, South Korea").location, {
    city: "Seoul",
    country: "South Korea",
    label: "Seoul, South Korea",
  });
  assert.deepEqual(parseTitle("Build Engineer - Singapore").location, {
    city: "Singapore",
    country: "Singapore",
    label: "Singapore, Singapore",
  });
});

test("title parser leaves unknown location and seniority explicit without inferring eligibility", () => {
  const parsed = parseTitle("Software Engineer - Remote");
  assert.equal(parsed.location, null);
  assert.equal(parsed.seniority, "Not stated");
  assert.equal(parsed.provenance, "parsed from listing text");
  assert.equal("eligibility" in parsed, false);
  assert.equal("workAuthorization" in parsed, false);
});

test("title parser recognizes seniority in the stated ascending order", () => {
  const cases = [
    ["Junior QA Engineer", "Intern/Junior"],
    ["Software Engineer II", "Mid (II)"],
    ["Sr. Tools Engineer", "Senior"],
    ["Senior Software Engineer", "Senior"],
    ["Staff Software Engineer", "Staff"],
    ["Principal Software Engineer", "Principal"],
    ["Lead Technical Artist", "Lead"],
    ["Revenue Accounting Manager", "Manager"],
    ["Director of Engineering", "Director/Head"],
    ["Head of Production", "Director/Head"],
  ];
  for (const [title, seniority] of cases) assert.equal(parseTitle(title).seniority, seniority, title);
});

test("title parser identifies contract and relocation mentions without changing eligibility", () => {
  const parsed = parseTitle("Technical Producer (Contract) - Relocation available - Los Angeles, USA");
  assert.equal(parsed.contract, true);
  assert.equal(parsed.relocationMentioned, true);
  assert.equal(parsed.location?.label, "Los Angeles, USA");
  assert.equal(parseTitle("Engineer - Los Angeles, USA").contract, false);
  assert.equal(parseTitle("Engineer - Los Angeles, USA").relocationMentioned, false);
});

test("freshness is calendar-day based and never calls a last-seen role open", () => {
  assert.deepEqual(getRoleFreshness({ lastSeenAt: "2026-10-27T17:55:00Z" }, SNAPSHOT_DATE), {
    key: "latest",
    label: "Seen in latest scan",
    daysAgo: 0,
    seenInLatestScan: true,
  });
  assert.deepEqual(getRoleFreshness({ lastSeenAt: "2026-10-24T17:55:00Z" }, SNAPSHOT_DATE), {
    key: "older",
    label: "Not seen in latest scan (3 days ago)",
    daysAgo: 3,
    seenInLatestScan: false,
  });
});

test("snapshot age stays neutral before seven days and warns at seven days", () => {
  assert.deepEqual(getSnapshotFreshness(SNAPSHOT_DATE, "2026-11-02T11:00:00Z"), { ageDays: 6, tone: "neutral" });
  assert.deepEqual(getSnapshotFreshness(SNAPSHOT_DATE, "2026-11-03T11:00:00Z"), { ageDays: 7, tone: "warning" });
});

test("filter facets return counts and target-family preset changes the result", () => {
  const roles = OPPORTUNITY_SNAPSHOT.opportunities;
  const all = filterOpportunities(roles, { generatedAt: SNAPSHOT_DATE });
  assert.equal(all.totalCount, 8);
  assert.ok(all.counts.roleFamilies.support >= 1);
  assert.ok(all.counts.seniorities.Senior >= 1);
  assert.ok(all.counts.countries.Singapore >= 1);
  assert.equal(all.counts.freshness.latest + all.counts.freshness.older, 8);

  const targets = filterOpportunities(roles, { generatedAt: SNAPSHOT_DATE, targetFamiliesOnly: true });
  assert.ok(targets.totalCount < all.totalCount);
  assert.ok(targets.roles.every((role) => TARGET_ROLE_FAMILIES.some((family) => family === role.classification.family)));
});

test("filters combine studio, family, seniority, country, contract, freshness and title search", () => {
  const roles = OPPORTUNITY_SNAPSHOT.opportunities;
  const result = filterOpportunities(roles, {
    generatedAt: SNAPSHOT_DATE,
    studioId: "riot-games",
    family: "support",
    seniority: "Not stated",
    country: "Ireland",
    contract: false,
    freshness: "older",
    query: "player support",
  });
  assert.equal(result.totalCount, 1);
  assert.equal(result.roles[0].title, "Player Support Specialist - Dublin, Ireland");
  assert.equal(result.counts.studios["Riot Games"], 1);
});

test("default sorting puts target families first, then less senior roles, then newer observations", () => {
  const result = filterOpportunities(OPPORTUNITY_SNAPSHOT.opportunities, { generatedAt: SNAPSHOT_DATE });
  const families = result.roles.map((role) => role.classification.family);
  const priority = (family) => {
    const index = TARGET_ROLE_FAMILIES.indexOf(family);
    return index === -1 ? TARGET_ROLE_FAMILIES.length : index;
  };
  assert.deepEqual(families, [...families].sort((left, right) => priority(left) - priority(right)));
  assert.equal(result.roles[0].classification.family, "support");
  assert.equal(result.roles[0].parsed.seniority, "Not stated");
});
