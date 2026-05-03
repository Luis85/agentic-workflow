import test from "node:test";
import assert from "node:assert/strict";
import {
  isMissingGitHubIssueError,
  serializeIssueFrontmatterValue,
} from "../../scripts/lib/issue-frontmatter.js";

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

test("GitHub issue missing error detection excludes transport failures", () => {
  assert.equal(isMissingGitHubIssueError("no issues match your search"), true);
  assert.equal(
    isMissingGitHubIssueError(
      "GraphQL: Could not resolve to an issue or pull request with the number of 999999999. (repository.issue)",
    ),
    true,
  );
  assert.equal(isMissingGitHubIssueError("HTTP 404: Not Found"), false);
  assert.equal(isMissingGitHubIssueError("repository not found"), false);
  assert.equal(isMissingGitHubIssueError("could not resolve host: github.com"), false);
  assert.equal(isMissingGitHubIssueError("GraphQL: Could not resolve to a Repository"), false);
});
