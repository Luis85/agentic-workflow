import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";
import { validateAgentArtifacts } from "../../scripts/lib/agent-artifacts.js";

test("repository agent artifacts satisfy the automation contract", () => {
  assert.deepEqual(validateAgentArtifacts(), []);
});

test("agent artifact validation reports missing required sections", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "agentic-workflow-agent-test-"));
  try {
    fs.mkdirSync(path.join(root, ".claude", "agents"), { recursive: true });
    fs.mkdirSync(path.join(root, ".claude", "skills", "broken"), { recursive: true });
    fs.mkdirSync(path.join(root, "agents", "operational", "broken-bot"), { recursive: true });
    fs.writeFileSync(
      path.join(root, ".claude", "agents", "broken.md"),
      "---\nname: broken\ndescription: Missing sections\ntools: [Read]\n---\n# Broken\n",
      "utf8",
    );
    fs.writeFileSync(
      path.join(root, ".claude", "skills", "broken", "SKILL.md"),
      "---\nname: broken\n---\nNo discoverable description.\n",
      "utf8",
    );
    fs.writeFileSync(
      path.join(root, "agents", "operational", "broken-bot", "PROMPT.md"),
      "# broken-bot\n\n## Role\n\nMissing the other required sections.\n",
      "utf8",
    );
    fs.writeFileSync(
      path.join(root, "agents", "operational", "broken-bot", "README.md"),
      "# broken-bot\n",
      "utf8",
    );

    const errors = validateAgentArtifacts(root);
    const codes = errors.filter((error) => typeof error !== "string").map((error) => error.code);
    assert.equal(codes.includes("AGENT_SECTION"), true);
    assert.equal(codes.includes("SKILL_DISCOVERY"), true);
    assert.equal(codes.includes("OP_AGENT_SECTION"), true);
    assert.equal(codes.includes("OP_AGENT_README_FRONTMATTER"), true);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
