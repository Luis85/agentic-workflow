import test from "node:test";
import assert from "node:assert/strict";
import {
  collectAnchors,
  githubSlug,
  linkDiagnostic,
  safeDecode,
  shouldIgnoreTarget,
  slugVariants,
} from "../../scripts/lib/markdown-links.js";

test("collectAnchors follows GitHub-style duplicate heading suffixes", () => {
  const anchors = collectAnchors("# Title\n## A `Code` Heading\n## A Code Heading\n");
  assert.equal(anchors.has("title"), true);
  assert.equal(anchors.has("a-code-heading"), true);
  assert.equal(anchors.has("a-code-heading-1"), true);
});

test("linkDiagnostic returns structured link failure details", () => {
  assert.deepEqual(linkDiagnostic("LINK_ANCHOR", "docs/example.md", 12, "./target.md#missing"), {
    code: "LINK_ANCHOR",
    path: "docs/example.md",
    line: 12,
    message: "links to missing anchor ./target.md#missing",
  });
});

test("slugVariants covers Unicode dash variants used in existing docs", () => {
  assert.deepEqual([...slugVariants("Alpha — Beta")].sort(), ["alpha---beta", "alpha--beta"].sort());
});

test("githubSlug removes Markdown punctuation", () => {
  assert.equal(githubSlug("Use `verify` now!"), "Use-verify-now");
});

test("safeDecode reports malformed URI escapes without throwing", () => {
  assert.deepEqual(safeDecode("%E0%A4%A"), { ok: false, value: "%E0%A4%A" });
});

test("shouldIgnoreTarget skips external and template-placeholder links", () => {
  assert.equal(shouldIgnoreTarget("https://example.com"), true);
  assert.equal(shouldIgnoreTarget("specs/<feature-slug>/workflow-state.md"), true);
  assert.equal(shouldIgnoreTarget("./local.md"), false);
});
