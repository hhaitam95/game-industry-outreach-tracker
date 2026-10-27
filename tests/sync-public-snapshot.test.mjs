import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile, access } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import sampleSnapshot from "../src/data/sample-public-opportunities.json" with { type: "json" };
import { syncPublicSnapshot } from "../scripts/sync-public-snapshot.mjs";
import { loadBundledOpportunitySnapshot } from "../src/lib/opportunities/snapshot.mjs";

test("loader selects the synced snapshot when present and the sample only when absent", () => {
  const live = loadBundledOpportunitySnapshot({ "../../data/public-opportunities.json": sampleSnapshot }, sampleSnapshot);
  assert.equal(live.origin, "live");
  assert.equal(live.snapshot.opportunities.length, 15);

  const sample = loadBundledOpportunitySnapshot({}, sampleSnapshot);
  assert.equal(sample.origin, "sample");
  assert.equal(sample.snapshot.opportunities.length, 15);

  const invalidLive = loadBundledOpportunitySnapshot(
    { "../../data/public-opportunities.json": { schemaVersion: 9 } },
    sampleSnapshot,
  );
  assert.equal(invalidLive.origin, "live");
  assert.equal(invalidLive.snapshot, null);
  assert.match(invalidLive.error, /missing or unsupported fields/);
});

test("sync script validates a local file and writes the normalized snapshot without network access", async () => {
  const directory = await mkdtemp(join(tmpdir(), "public-snapshot-sync-"));
  const source = join(directory, "source.json");
  const destination = join(directory, "generated.json");
  try {
    await writeFile(source, JSON.stringify(sampleSnapshot), "utf8");
    const result = await syncPublicSnapshot({ from: source, destination });
    assert.equal(result.roleCount, 15);
    assert.equal(result.destination, destination);
    assert.deepEqual(JSON.parse(await readFile(destination, "utf8")), sampleSnapshot);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("sync script writes nothing when JSON or snapshot validation fails", async () => {
  const directory = await mkdtemp(join(tmpdir(), "public-snapshot-sync-invalid-"));
  const source = join(directory, "invalid.json");
  const destination = join(directory, "generated.json");
  try {
    await writeFile(source, JSON.stringify({ schemaVersion: 1, generatedAt: "2000-01-01T00:00:00Z", opportunities: [{ status: "open" }] }), "utf8");
    await assert.rejects(syncPublicSnapshot({ from: source, destination }), /missing or unsupported fields/);
    await assert.rejects(access(destination));

    await writeFile(destination, "preserve-existing-content\n", "utf8");
    await assert.rejects(syncPublicSnapshot({ from: source, destination }), /missing or unsupported fields/);
    assert.equal(await readFile(destination, "utf8"), "preserve-existing-content\n");

    await writeFile(source, "{not-json", "utf8");
    await assert.rejects(syncPublicSnapshot({ from: source, destination }), /not valid JSON/);
    assert.equal(await readFile(destination, "utf8"), "preserve-existing-content\n");
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
