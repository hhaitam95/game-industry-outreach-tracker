import assert from "node:assert/strict";
import test from "node:test";
import { findUnexpectedRegistryUrls } from "../scripts/lib/lockfile-registry.mjs";

function lockfileWithResolved(resolved) {
  return {
    lockfileVersion: 3,
    packages: {
      "": {},
      "node_modules/example": { version: "1.0.0", resolved },
    },
  };
}

test("accepts HTTPS tarball URLs on the canonical npm registry origin", () => {
  const violations = findUnexpectedRegistryUrls(
    lockfileWithResolved("https://registry.npmjs.org/example/-/example-1.0.0.tgz"),
  );
  assert.deepEqual(violations, []);
});

test("rejects mirror registries", () => {
  const violations = findUnexpectedRegistryUrls(
    lockfileWithResolved("https://registry.npmmirror.com/example/-/example-1.0.0.tgz"),
  );
  assert.deepEqual(violations, [
    { packagePath: "node_modules/example", reason: "unsupported-origin" },
  ]);
});

test("rejects deceptive registry host suffixes and HTTP URLs", () => {
  assert.deepEqual(
    findUnexpectedRegistryUrls(
      lockfileWithResolved("https://registry.npmjs.org.attacker.example/example.tgz"),
    ),
    [{ packagePath: "node_modules/example", reason: "unsupported-origin" }],
  );
  assert.deepEqual(
    findUnexpectedRegistryUrls(
      lockfileWithResolved("http://registry.npmjs.org/example/-/example-1.0.0.tgz"),
    ),
    [{ packagePath: "node_modules/example", reason: "insecure-protocol" }],
  );
});

test("rejects credentials even when the URL origin matches", () => {
  assert.deepEqual(
    findUnexpectedRegistryUrls(
      lockfileWithResolved("https://user:password@registry.npmjs.org/example.tgz"),
    ),
    [{ packagePath: "node_modules/example", reason: "unsupported-origin" }],
  );
});

test("rejects malformed or non-string resolved values without echoing the value", () => {
  for (const resolved of ["not a URL", null, 42]) {
    assert.deepEqual(findUnexpectedRegistryUrls(lockfileWithResolved(resolved)), [
      { packagePath: "node_modules/example", reason: "invalid-url" },
    ]);
  }
});

test("rejects a malformed lockfile root", () => {
  assert.deepEqual(findUnexpectedRegistryUrls(null), [
    { packagePath: "<lockfile>", reason: "missing-packages-object" },
  ]);
  assert.deepEqual(findUnexpectedRegistryUrls({ packages: [] }), [
    { packagePath: "<lockfile>", reason: "missing-packages-object" },
  ]);
});

test("ignores lock entries without resolved tarball URLs", () => {
  assert.deepEqual(findUnexpectedRegistryUrls({ packages: { "": {}, "node_modules/workspace": {} } }), []);
});
