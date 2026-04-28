import test from "node:test";
import assert from "node:assert/strict";
import { extractFrontmatter, parseSimpleYaml, replaceGeneratedBlock, toPosix } from "../../scripts/lib/repo.js";

test("parseSimpleYaml handles repository frontmatter subset", () => {
  assert.deepEqual(
    parseSimpleYaml(`
title: "Example"
count: 3
empty: []
owner: null
artifacts:
  idea.md: complete
  spec.md: in-progress # inline comment
`),
    {
      title: "Example",
      count: 3,
      empty: [],
      owner: null,
      artifacts: {
        "idea.md": "complete",
        "spec.md": "in-progress",
      },
    },
  );
});

test("extractFrontmatter splits raw YAML from body", () => {
  assert.deepEqual(extractFrontmatter("---\nid: TEST-ABC-001\n---\n# Body\n"), {
    raw: "id: TEST-ABC-001",
    body: "# Body\n",
  });
});

test("replaceGeneratedBlock replaces only named generated content", () => {
  const text = [
    "Before",
    "<!-- BEGIN GENERATED: sample -->",
    "old",
    "<!-- END GENERATED: sample -->",
    "After",
  ].join("\n");

  assert.equal(
    replaceGeneratedBlock(text, "sample", "new\n"),
    [
      "Before",
      "<!-- BEGIN GENERATED: sample -->",
      "new",
      "<!-- END GENERATED: sample -->",
      "After",
    ].join("\n"),
  );
});

test("toPosix normalizes Windows separators", () => {
  assert.equal(toPosix("docs\\adr\\README.md"), "docs/adr/README.md");
});
