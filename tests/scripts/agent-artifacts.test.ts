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

test("agent artifact validation reports missing path and command references", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "agentic-workflow-agent-reference-test-"));
  try {
    fs.mkdirSync(path.join(root, ".claude", "skills", "broken"), { recursive: true });
    fs.writeFileSync(path.join(root, "package.json"), JSON.stringify({ scripts: { verify: "tsx scripts/verify.ts" } }), "utf8");
    fs.writeFileSync(
      path.join(root, ".claude", "skills", "broken", "SKILL.md"),
      [
        "---",
        "name: broken",
        "description: Broken references.",
        "---",
        "# Broken",
        "",
        "Use `docs/missing.md` and run `npm run missing`.",
      ].join("\n"),
      "utf8",
    );

    const errors = validateAgentArtifacts(root);
    const codes = errors.filter((error) => typeof error !== "string").map((error) => error.code);
    assert.equal(codes.includes("AGENT_PATH"), true);
    assert.equal(codes.includes("AGENT_COMMAND"), true);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("agent artifact validation ignores examples and placeholders", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "agentic-workflow-agent-example-test-"));
  try {
    fs.mkdirSync(path.join(root, ".claude", "skills", "example"), { recursive: true });
    fs.writeFileSync(path.join(root, "package.json"), JSON.stringify({ scripts: { verify: "tsx scripts/verify.ts" } }), "utf8");
    fs.writeFileSync(
      path.join(root, ".claude", "skills", "example", "SKILL.md"),
      [
        "---",
        "name: example",
        "description: Example references.",
        "---",
        "# Example",
        "",
        "For example, a generated report may be `docs/reports/YYYY-MM-DD.md`.",
        "```bash",
        "npm run project-specific-command",
        "```",
      ].join("\n"),
      "utf8",
    );

    assert.deepEqual(validateAgentArtifacts(root), []);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("agent artifact validation checks workflow-root and uppercase file paths", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "agentic-workflow-agent-workflow-path-test-"));
  try {
    fs.mkdirSync(path.join(root, ".claude", "skills", "paths"), { recursive: true });
    fs.writeFileSync(path.join(root, "package.json"), JSON.stringify({ scripts: {} }), "utf8");
    fs.writeFileSync(
      path.join(root, ".claude", "skills", "paths", "SKILL.md"),
      [
        "---",
        "name: paths",
        "description: Path validation.",
        "---",
        "# Paths",
        "",
        "Read `specs/missing/workflow-state.md`, `roadmaps/missing/roadmap-state.md`, and `docs/MISSING.md`.",
      ].join("\n"),
      "utf8",
    );

    const errors = validateAgentArtifacts(root);
    const messages = errors.filter((error) => typeof error !== "string").map((error) => error.message);
    assert.equal(messages.some((message) => message.includes("specs/missing/workflow-state.md")), true);
    assert.equal(messages.some((message) => message.includes("roadmaps/missing/roadmap-state.md")), true);
    assert.equal(messages.some((message) => message.includes("docs/MISSING.md")), true);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("agent artifact validation ignores lazy roots and optional legacy references", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "agentic-workflow-agent-lazy-path-test-"));
  try {
    fs.mkdirSync(path.join(root, ".claude", "skills", "lazy"), { recursive: true });
    fs.writeFileSync(path.join(root, "package.json"), JSON.stringify({ scripts: {} }), "utf8");
    fs.writeFileSync(
      path.join(root, ".claude", "skills", "lazy", "SKILL.md"),
      [
        "---",
        "name: lazy",
        "description: Lazy references.",
        "---",
        "# Lazy",
        "",
        "Optional workspaces may include `discovery/`, `portfolio/`, `docs/CONTEXT.md`, and `docs/UBIQUITOUS_LANGUAGE.md`.",
      ].join("\n"),
      "utf8",
    );

    assert.deepEqual(validateAgentArtifacts(root), []);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("agent artifact validation accepts existing paths with Markdown suffixes", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "agentic-workflow-agent-anchor-path-test-"));
  try {
    fs.mkdirSync(path.join(root, ".claude", "skills", "anchors"), { recursive: true });
    fs.mkdirSync(path.join(root, "docs"), { recursive: true });
    fs.writeFileSync(path.join(root, "package.json"), JSON.stringify({ scripts: {} }), "utf8");
    fs.writeFileSync(path.join(root, "docs", "verify-gate.md"), "# Verify gate\n", "utf8");
    fs.writeFileSync(
      path.join(root, ".claude", "skills", "anchors", "SKILL.md"),
      [
        "---",
        "name: anchors",
        "description: Anchored references.",
        "---",
        "# Anchors",
        "",
        "Read `docs/verify-gate.md#run-the-full-gate` and `docs/verify-gate.md?plain=1`.",
      ].join("\n"),
      "utf8",
    );

    assert.deepEqual(validateAgentArtifacts(root), []);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("agent artifact validation ignores tilde fenced examples", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "agentic-workflow-agent-tilde-fence-test-"));
  try {
    fs.mkdirSync(path.join(root, ".claude", "skills", "tilde"), { recursive: true });
    fs.writeFileSync(path.join(root, "package.json"), JSON.stringify({ scripts: {} }), "utf8");
    fs.writeFileSync(
      path.join(root, ".claude", "skills", "tilde", "SKILL.md"),
      [
        "---",
        "name: tilde",
        "description: Tilde fenced examples.",
        "---",
        "# Tilde",
        "",
        "~~~bash",
        "npm run missing",
        "cat docs/missing.md",
        "~~~",
      ].join("\n"),
      "utf8",
    );

    assert.deepEqual(validateAgentArtifacts(root), []);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
