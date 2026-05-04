import test from "node:test";
import assert from "node:assert/strict";
import {
  collectAnchors,
  githubSlug,
  linkDiagnostic,
  safeDecode,
  shouldIgnoreTarget,
  slugVariants,
  stripCodeRegions,
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

test("stripCodeRegions blanks fenced code blocks while preserving line numbers", () => {
  const input = [
    "before",
    "```",
    "see [text](missing.md) here",
    "```",
    "after [real](./real.md)",
  ].join("\n");
  const stripped = stripCodeRegions(input).split("\n");
  assert.equal(stripped.length, 5);
  assert.equal(stripped[0], "before");
  assert.equal(stripped[1], "");
  assert.equal(stripped[2], "");
  assert.equal(stripped[3], "");
  assert.equal(stripped[4], "after [real](./real.md)");
});

test("stripCodeRegions blanks tilde fences and respects fence length", () => {
  const input = ["~~~~", "[x](y.md)", "~~~", "still inside [a](b.md)", "~~~~", "out"].join("\n");
  const stripped = stripCodeRegions(input).split("\n");
  assert.deepEqual(stripped, ["", "", "", "", "", "out"]);
});

test("stripCodeRegions blanks inline code spans without shifting columns", () => {
  const stripped = stripCodeRegions("see `0027-adopt-shape-b.md` and [real](./real.md)");
  assert.equal(stripped.length, "see `0027-adopt-shape-b.md` and [real](./real.md)".length);
  assert.equal(stripped.includes("0027-adopt-shape-b.md"), false);
  assert.equal(stripped.endsWith("[real](./real.md)"), true);
});

test("stripCodeRegions handles nested backtick runs in inline code", () => {
  const stripped = stripCodeRegions("text ``with ` backtick (foo.md)`` rest");
  assert.equal(stripped.includes("foo.md"), false);
  assert.equal(stripped.startsWith("text "), true);
  assert.equal(stripped.endsWith(" rest"), true);
});

test("stripCodeRegions leaves unmatched backticks alone", () => {
  const stripped = stripCodeRegions("a ` lone backtick and [link](./real.md)");
  assert.equal(stripped, "a ` lone backtick and [link](./real.md)");
});

test("stripCodeRegions treats escaped backticks as literals, not code-span delimiters", () => {
  const stripped = stripCodeRegions("\\`[bad](missing.md)\\` real");
  assert.equal(
    stripped,
    "\\`[bad](missing.md)\\` real",
    "escaped backticks must not blank the link target between them",
  );
});

test("stripCodeRegions still strips spans when an escape is itself escaped", () => {
  const input = "leading \\\\`code (foo.md)` trailing";
  const stripped = stripCodeRegions(input);
  assert.equal(stripped.length, input.length);
  assert.equal(stripped.includes("foo.md"), false, "double-backslash leaves backtick unescaped");
  assert.equal(stripped.startsWith("leading \\\\"), true);
  assert.equal(stripped.endsWith(" trailing"), true);
});

test("stripCodeRegions rejects backtick fence openers whose info string contains backticks", () => {
  const input = ["```js `inline` style explainer", "after [real](./real.md)"].join("\n");
  const stripped = stripCodeRegions(input).split("\n");
  assert.equal(stripped.length, 2);
  assert.equal(
    stripped[1],
    "after [real](./real.md)",
    "a backtick line with backtick info string must not open a fence",
  );
});
