import test from "node:test";
import assert from "node:assert/strict";
import {
  collectAnchors,
  githubSlug,
  isCodeFenceDelimiter,
  linkDiagnostic,
  safeDecode,
  shouldIgnoreTarget,
  slugVariants,
  stripCodeRegions,
  stripInlineCode,
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

test("stripCodeRegions blanks fenced blocks nested in block quotes", () => {
  const input = ["> ```", "> [x](missing.md)", "> ```", "after [real](./real.md)"].join("\n");
  const stripped = stripCodeRegions(input).split("\n");
  assert.equal(stripped.length, 4);
  assert.equal(stripped[0], "");
  assert.equal(stripped[1], "");
  assert.equal(stripped[2], "");
  assert.equal(stripped[3], "after [real](./real.md)");
});

test("stripCodeRegions does not pair backticks across setext underlines or thematic breaks", () => {
  const acrossSetext = ["Title `", "===", "See [bad](missing.md) and `ok`."].join("\n");
  const stripped1 = stripCodeRegions(acrossSetext);
  assert.equal(
    stripped1.includes("[bad](missing.md)"),
    true,
    "stray backtick before a setext underline must not pair across blocks",
  );
  assert.equal(stripped1.includes("ok"), false);

  const acrossThematic = ["paragraph `", "---", "after [bad](missing.md) `tail`"].join("\n");
  const stripped2 = stripCodeRegions(acrossThematic);
  assert.equal(stripped2.includes("[bad](missing.md)"), true);
  assert.equal(stripped2.includes("tail"), false);

  const acrossThematicAsterisks = ["lead `", "***", "[real](./real.md) `code`"].join("\n");
  const stripped3 = stripCodeRegions(acrossThematicAsterisks);
  assert.equal(stripped3.includes("[real](./real.md)"), true);
  assert.equal(stripped3.includes("code"), false);
});

test("stripCodeRegions does not pair backticks across heading or blank-line boundaries", () => {
  const acrossHeading = ["# Title `", "See [bad](missing.md) and `ok`."].join("\n");
  const stripped1 = stripCodeRegions(acrossHeading);
  assert.equal(
    stripped1.includes("[bad](missing.md)"),
    true,
    "stray backtick in heading must not consume a link in the paragraph below",
  );
  assert.equal(stripped1.includes("ok"), false, "real inline code in the paragraph is still stripped");

  const acrossBlank = ["leading `paragraph", "", "[real](./real.md) paired `tail"].join("\n");
  const stripped2 = stripCodeRegions(acrossBlank);
  assert.equal(
    stripped2.includes("[real](./real.md)"),
    true,
    "backticks must not pair across a blank line",
  );
});

test("stripCodeRegions handles inline code spans that cross line boundaries", () => {
  const input = ["before `code", "[x](missing.md)", "end` after"].join("\n");
  const stripped = stripCodeRegions(input);
  assert.equal(stripped.length, input.length);
  assert.equal(stripped.includes("missing.md"), false, "link inside multi-line span is blanked");
  assert.equal(stripped.startsWith("before "), true);
  assert.equal(stripped.endsWith(" after"), true);
  assert.equal(stripped.split("\n").length, 3, "newlines are preserved across the span");
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

test("isCodeFenceDelimiter identifies opening and closing fenced code block markers", () => {
  assert.equal(isCodeFenceDelimiter("```"), true);
  assert.equal(isCodeFenceDelimiter("```typescript"), true);
  assert.equal(isCodeFenceDelimiter("~~~"), true);
  assert.equal(isCodeFenceDelimiter("~~~~"), true);
  assert.equal(isCodeFenceDelimiter("``"), false);
  assert.equal(isCodeFenceDelimiter("not a fence"), false);
  assert.equal(isCodeFenceDelimiter("  ```"), false);
});

test("stripInlineCode removes backtick-delimited code spans from a line", () => {
  assert.equal(stripInlineCode("`[text](missing.md)`"), "");
  assert.equal(stripInlineCode("See `[text](path.md)` for details"), "See  for details");
  assert.equal(stripInlineCode("``double-backtick``"), "");
  assert.equal(stripInlineCode("[real](link.md) and `[fake](missing.md)`"), "[real](link.md) and ");
});

test("bare path inside a code fence is not flagged as a broken link (isCodeFenceDelimiter + stripInlineCode guard)", () => {
  const fencedBlock = "```\n[broken](no-such-file.md)\n```";
  const lines = fencedBlock.split("\n");
  const linkPattern = /!?\[[^\]]*?\]\(([^)\s]+(?:\s+"[^"]*")?)\)/g;
  let inFence = false;
  const matches: string[] = [];
  for (const line of lines) {
    if (isCodeFenceDelimiter(line)) { inFence = !inFence; continue; }
    if (inFence) continue;
    for (const m of stripInlineCode(line).matchAll(linkPattern)) matches.push(m[1]);
  }
  assert.deepEqual(matches, []);
});

test("stripCodeRegions does not pair backticks across indented code block lines", () => {
  const input = ["lead `", "    indented code", "[bad](missing.md) `ok`"].join("\n");
  const stripped = stripCodeRegions(input);
  assert.equal(
    stripped.includes("[bad](missing.md)"),
    true,
    "stray opener before indented code must not consume a link after it",
  );
  assert.equal(stripped.includes("ok"), false, "real inline code after the block is still stripped");
});
