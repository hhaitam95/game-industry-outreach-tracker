import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

const root = process.cwd();
const validatorSource = readFileSync(path.join(root, "scripts/check-studio-directory.mjs"), "utf8");
const studiosSource = JSON.parse(
  readFileSync(path.join(root, "src/data/speculative-route-directory.json"), "utf8"),
);
const profilesSource = JSON.parse(
  readFileSync(path.join(root, "src/data/studio-profiles.json"), "utf8"),
);

test("directory validator rejects duplicate official application routes", () => {
  const tempRoot = mkdtempSync(path.join(os.tmpdir(), "studio-directory-duplicate-"));
  try {
    const scriptsDir = path.join(tempRoot, "scripts");
    const dataDir = path.join(tempRoot, "src", "data");
    mkdirSync(scriptsDir, { recursive: true });
    mkdirSync(dataDir, { recursive: true });

    const duplicate = {
      ...studiosSource.find((studio) => studio.name === "FakeFish"),
      name: "FakeFish Duplicate",
    };
    assert.ok(duplicate.applicationUrl, "the fixture source must contain a verified application URL");

    const studios = [...studiosSource, duplicate];
    const profiles = {
      ...profilesSource,
      "FakeFish Duplicate": { ...profilesSource.FakeFish },
    };

    writeFileSync(path.join(scriptsDir, "check-studio-directory.mjs"), validatorSource);
    writeFileSync(
      path.join(dataDir, "speculative-route-directory.json"),
      JSON.stringify(studios, null, 2),
    );
    writeFileSync(path.join(dataDir, "studio-profiles.json"), JSON.stringify(profiles, null, 2));

    const result = spawnSync(
      process.execPath,
      [path.join(scriptsDir, "check-studio-directory.mjs")],
      { cwd: tempRoot, encoding: "utf8" },
    );

    assert.notEqual(result.status, 0, "duplicate employer/application routes must fail validation");
    assert.match(
      result.stderr,
      /Duplicate employer\/application route: FakeFish and FakeFish Duplicate\./,
    );
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }
});
