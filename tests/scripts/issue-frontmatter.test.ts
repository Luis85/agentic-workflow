import test from "node:test";
import assert from "node:assert/strict";
import { serializeIssueFrontmatterValue } from "../../scripts/lib/issue-frontmatter.js";

test("issue frontmatter serializer escapes quoted array items", () => {
  assert.equal(
    serializeIssueFrontmatterValue(['plain', 'has "quote"', 'has \\ slash']),
    '["plain", "has \\"quote\\"", "has \\\\ slash"]',
  );
});

test("issue frontmatter serializer quotes scalar strings only when needed", () => {
  assert.equal(serializeIssueFrontmatterValue("plain"), "plain");
  assert.equal(serializeIssueFrontmatterValue("has: colon"), '"has: colon"');
  assert.equal(serializeIssueFrontmatterValue('has "quote"'), '"has \\"quote\\""');
});
