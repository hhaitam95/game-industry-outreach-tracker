import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { inspectPagesArtifact } from "../scripts/check-pages-artifact.mjs";

async function withArtifact(run) {
  const root = await mkdtemp(path.join(os.tmpdir(), "pages-artifact-"));
  try {
    await mkdir(path.join(root, "assets"), { recursive: true });
    await writeFile(
      path.join(root, "index.html"),
      '<meta http-equiv="Content-Security-Policy" content="default-src &quot;self&quot;"><script type="module" src="/game-industry-outreach-tracker-site/assets/app.js"></script><link rel="stylesheet" href="/game-industry-outreach-tracker-site/assets/app.css">',
    );
    await writeFile(path.join(root, "assets", "app.js"), "console.log('public app');\n");
    await writeFile(path.join(root, "assets", "app.css"), "body { margin: 0; }\n");
    await run(root);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

test("accepts a static artifact with local assets and a CSP", async () => {
  await withArtifact(async (root) => {
    assert.deepEqual(inspectPagesArtifact(root), []);
  });
});

test("rejects resume/document/database files without revealing their names", async () => {
  await withArtifact(async (root) => {
    await writeFile(path.join(root, "candidate-resume.pdf"), "synthetic-only");
    const findings = inspectPagesArtifact(root);
    assert.ok(findings.includes("prohibited-public-file"));
    assert.equal(JSON.stringify(findings).includes("candidate-resume.pdf"), false);
  });
});

test("rejects credential-like content without echoing the match", async () => {
  await withArtifact(async (root) => {
    await writeFile(path.join(root, "assets", "app.js"), "const token = 'ghp_123456789012345678901234567890';\n");
    const findings = inspectPagesArtifact(root);
    assert.ok(findings.includes("credential-like-content"));
    assert.equal(JSON.stringify(findings).includes("ghp_"), false);
  });
});

test("rejects external script/link references", async () => {
  await withArtifact(async (root) => {
    await writeFile(
      path.join(root, "index.html"),
      '<meta http-equiv="Content-Security-Policy" content="default-src self"><script src="https://cdn.example/app.js"></script><link rel="stylesheet" href="/game-industry-outreach-tracker-site/assets/app.css">',
    );
    const findings = inspectPagesArtifact(root);
    assert.ok(findings.includes("external-or-unsafe-index-asset-reference"));
  });
});

test("rejects source maps because the public build does not need them", async () => {
  await withArtifact(async (root) => {
    await writeFile(path.join(root, "assets", "app.js.map"), "{}");
    const findings = inspectPagesArtifact(root);
    assert.ok(findings.includes("prohibited-public-file"));
  });
});
