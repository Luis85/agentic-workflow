import test from "node:test";
import assert from "node:assert/strict";
import {
  stubifyDoc,
  STUB_FRONTMATTER_KEYS,
  STUB_TODO_MARKER,
} from "../../scripts/lib/release-stubify.js";

const BUILT_UP_DOC = `---
title: Branching model
folder: docs
description: How topic branches integrate.
entry_point: false
---

# Branching model

A small, opinionated model designed to make automated review work without surprises.

## The branches

Pick **one** of the two shapes below for your project.

### Shape A — single integration branch

Long built-up content with examples here.

\`\`\`
# This is shell, not a heading
\`\`\`

## Verify gate

Run \`npm run verify\` before push.
`;

test("stubifyDoc emits frontmatter with all required keys", () => {
  const result = stubifyDoc({ path: "docs/branching.md", text: BUILT_UP_DOC });
  for (const key of STUB_FRONTMATTER_KEYS) {
    assert.match(
      result.text,
      new RegExp(`^${key}:`, "m"),
      `expected frontmatter key \`${key}\``,
    );
  }
});

test("stubifyDoc preserves frontmatter title when present", () => {
  const result = stubifyDoc({ path: "docs/branching.md", text: BUILT_UP_DOC });
  assert.match(result.text, /^title: ['"]?Branching model['"]?$/m);
});

test("stubifyDoc derives folder from the path", () => {
  const result = stubifyDoc({ path: "docs/glossary/agent.md", text: "# Agent\n\nlong content\n" });
  assert.match(result.text, /^folder: ['"]?docs\/glossary['"]?$/m);
});

test("stubifyDoc folder for a top-level docs/ doc", () => {
  const result = stubifyDoc({ path: "docs/specorator.md", text: "# Specorator\n\nbody\n" });
  assert.match(result.text, /^folder: ['"]?docs['"]?$/m);
});

test("stubifyDoc emits a top-level `# ` heading", () => {
  const result = stubifyDoc({ path: "docs/branching.md", text: BUILT_UP_DOC });
  assert.match(result.text, /^# Branching model$/m);
});

test("stubifyDoc emits the TODO stub marker", () => {
  const result = stubifyDoc({ path: "docs/branching.md", text: BUILT_UP_DOC });
  assert.ok(
    result.text.includes(STUB_TODO_MARKER),
    `expected stub TODO marker \`${STUB_TODO_MARKER}\``,
  );
});

test("stubifyDoc preserves `## ` section headings", () => {
  const result = stubifyDoc({ path: "docs/branching.md", text: BUILT_UP_DOC });
  assert.match(result.text, /^## The branches$/m);
  assert.match(result.text, /^## Verify gate$/m);
});

test("stubifyDoc replaces section bodies with TODO markers", () => {
  const result = stubifyDoc({ path: "docs/branching.md", text: BUILT_UP_DOC });
  // Original built-up body is gone
  assert.doesNotMatch(result.text, /A small, opinionated model/);
  assert.doesNotMatch(result.text, /Pick \*\*one\*\* of the two shapes/);
});

test("stubifyDoc drops `### ` and deeper headings", () => {
  const result = stubifyDoc({ path: "docs/branching.md", text: BUILT_UP_DOC });
  assert.doesNotMatch(result.text, /^### Shape A/m);
});

test("stubifyDoc ignores `# ` lines inside fenced code blocks", () => {
  const text = `# Real heading

\`\`\`
# This is shell, not a heading
\`\`\`

## Section
`;
  const result = stubifyDoc({ path: "docs/sample.md", text });
  // Title is from the real `# `, not from the code-block line.
  assert.match(result.text, /^title: ['"]?Real heading['"]?$/m);
});

test("stubifyDoc derives title from first `# ` heading when no frontmatter", () => {
  const text = "# Verify gate\n\nbody content\n";
  const result = stubifyDoc({ path: "docs/verify-gate.md", text });
  assert.match(result.text, /^title: ['"]?Verify gate['"]?$/m);
});

test("stubifyDoc falls back to filename-derived title", () => {
  const text = "Body without any heading or frontmatter.\n";
  const result = stubifyDoc({
    path: "docs/some-other-page.md",
    text,
  });
  assert.match(result.text, /^title: ['"]?Some other page['"]?$/m);
});

test("stubifyDoc preserves frontmatter description when present", () => {
  const result = stubifyDoc({ path: "docs/branching.md", text: BUILT_UP_DOC });
  assert.match(
    result.text,
    /^description: ['"]?How topic branches integrate\.['"]?$/m,
  );
});

test("stubifyDoc synthesises description when missing", () => {
  const text = "# Verify gate\n\nbody\n";
  const result = stubifyDoc({ path: "docs/verify-gate.md", text });
  assert.match(result.text, /^description: /m);
});

test("stubifyDoc emits `entry_point: false` by default", () => {
  const result = stubifyDoc({ path: "docs/branching.md", text: BUILT_UP_DOC });
  assert.match(result.text, /^entry_point: false$/m);
});

test("stubifyDoc preserves explicit `entry_point: true` from frontmatter", () => {
  const text = `---
title: ADR Index
folder: docs/adr
description: All accepted ADRs.
entry_point: true
---

# ADR Index

content
`;
  const result = stubifyDoc({ path: "docs/adr/README.md", text });
  assert.match(result.text, /^entry_point: true$/m);
});

test("stubifyDoc appends the stub trailer", () => {
  const result = stubifyDoc({ path: "docs/branching.md", text: BUILT_UP_DOC });
  assert.match(result.text, /## How to use this stub/);
});

test("stubifyDoc handles a doc with no `## ` sections", () => {
  const text = `# Glossary entry

A single paragraph entry.
`;
  const result = stubifyDoc({ path: "docs/glossary/agent.md", text });
  // Still emits the frontmatter, top heading, intent TODO, trailer.
  for (const key of STUB_FRONTMATTER_KEYS) {
    assert.match(result.text, new RegExp(`^${key}:`, "m"));
  }
  assert.match(result.text, /^# Glossary entry$/m);
  assert.ok(result.text.includes(STUB_TODO_MARKER));
});

test("stubifyDoc handles CRLF line endings", () => {
  const text = "---\r\ntitle: Branching\r\nfolder: docs\r\ndescription: x\r\nentry_point: false\r\n---\r\n\r\n# Branching\r\n\r\nbuilt-up content\r\n\r\n## Section\r\n\r\nbuilt-up section content\r\n";
  const result = stubifyDoc({ path: "docs/branching.md", text });
  assert.match(result.text, /^# Branching$/m);
  assert.match(result.text, /^## Section$/m);
  assert.ok(result.text.includes(STUB_TODO_MARKER));
});
