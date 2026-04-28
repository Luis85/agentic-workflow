import test from "node:test";
import assert from "node:assert/strict";
import { fixObsidianFrontmatter, fixObsidianFrontmatterBlock, obsidianDiagnosticsForFrontmatter } from "../../scripts/lib/obsidian.js";

test("obsidian frontmatter accepts readable repository YAML", () => {
  assert.deepEqual(
    obsidianDiagnosticsForFrontmatter(
      "specs/example/workflow-state.md",
      [
        "feature: example",
        "status: active",
        "artifacts:",
        "  idea.md: complete",
        "  requirements.md: in-progress",
        "tags: [workflow, quality]",
      ].join("\n"),
    ),
    [],
  );
});

test("obsidian frontmatter rejects duplicate and malformed properties", () => {
  assert.deepEqual(
    obsidianDiagnosticsForFrontmatter(
      "docs/example.md",
      [
        "title: Example",
        "title: Duplicate",
        "bad key: value",
        "owner:value",
        "  too: deep",
        "link: [[Unquoted Link]]",
      ].join("\n"),
    ),
    [
      {
        code: "OBS_PROPERTY_DUPLICATE",
        path: "docs/example.md",
        line: 3,
        message: "property title duplicates the property on line 2",
      },
      {
        code: "OBS_PROPERTY_NAME",
        path: "docs/example.md",
        line: 4,
        message: "property names must use only letters, numbers, underscores, or hyphens",
      },
      {
        code: "OBS_PROPERTY_SYNTAX",
        path: "docs/example.md",
        line: 5,
        message: "property names must be followed by a colon and a space",
      },
      {
        code: "OBS_PROPERTY_LINK_QUOTE",
        path: "docs/example.md",
        line: 7,
        message: "internal links in property values must be quoted for Obsidian Properties",
      },
    ],
  );
});

test("obsidian frontmatter rejects JSON-style metadata", () => {
  assert.deepEqual(obsidianDiagnosticsForFrontmatter("docs/example.md", '{"title":"Example"}'), [
    {
      code: "OBS_FRONTMATTER_JSON",
      path: "docs/example.md",
      line: 2,
      message: "frontmatter must use readable YAML properties, not JSON-style metadata",
    },
  ]);
});

test("fixObsidianFrontmatterBlock quotes scalar wikilinks and preserves comments", () => {
  assert.equal(
    fixObsidianFrontmatterBlock(
      [
        "title: Example",
        "related: [[Some Note]] # human context",
        "aliases: [trace, [[Already list-safe]]]",
        "nested:",
        "  link: [[Nested Note]]",
      ].join("\n"),
    ),
    [
      "title: Example",
      "related: \"[[Some Note]]\" # human context",
      "aliases: [trace, [[Already list-safe]]]",
      "nested:",
      "  link: [[Nested Note]]",
    ].join("\n"),
  );
});

test("fixObsidianFrontmatter rewrites only valid frontmatter blocks", () => {
  assert.deepEqual(fixObsidianFrontmatter("---\nlink: [[Note]]\n---\n# Body\n"), {
    text: "---\nlink: \"[[Note]]\"\n---\n# Body\n",
    changed: true,
  });

  assert.deepEqual(fixObsidianFrontmatter("# Body\nlink: [[Note]]\n"), {
    text: "# Body\nlink: [[Note]]\n",
    changed: false,
  });
});

test("fixObsidianFrontmatter preserves CRLF when no metadata changes", () => {
  const text = "---\r\ntitle: Example\r\n---\r\n# Body\r\n";

  assert.deepEqual(fixObsidianFrontmatter(text), {
    text,
    changed: false,
  });
});

test("fixObsidianFrontmatter preserves CRLF when repairing metadata", () => {
  assert.deepEqual(fixObsidianFrontmatter("---\r\nlink: [[Note]]\r\n---\r\n# Body\r\n"), {
    text: "---\r\nlink: \"[[Note]]\"\r\n---\r\n# Body\r\n",
    changed: true,
  });
});
