import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  PUBLIC_SURFACE_DIAGNOSTIC_CODES,
  publicSurfaceDiagnostics,
  publicSurfaceInventory,
} from "../../scripts/lib/public-surfaces.js";

test("public surface inventory derives version, agents, and skills from disk", () => {
  const root = createFixture();
  try {
    assert.deepEqual(publicSurfaceInventory(root), {
      version: "0.5.0",
      agents: ["analyst", "brand-reviewer"],
      skills: ["orchestrate", "verify"],
    });
  } finally {
    cleanup(root);
  }
});

test("public surface diagnostics pass when public copy matches source data", () => {
  const root = createFixture();
  try {
    assert.deepEqual(publicSurfaceDiagnostics(root), []);
  } finally {
    cleanup(root);
  }
});

test("public surface diagnostics reject version and roster drift", () => {
  const root = createFixture({
    readme: "# Specorator\n\n![Version](https://img.shields.io/badge/version-v0.2-blue)\n\n> **Status:** v0.2\n",
    site: "<html><body>v0.2 1 agents 1 skills <code>analyst</code></body></html>",
    changelog: "# Changelog\n\n## [v0.2]\n",
  });
  try {
    const diagnostics = publicSurfaceDiagnostics(root);
    const codes = new Set(diagnostics.map((diagnostic) => diagnostic.code));

    assert.ok(codes.has(PUBLIC_SURFACE_DIAGNOSTIC_CODES.ReadmeVersion));
    assert.ok(codes.has(PUBLIC_SURFACE_DIAGNOSTIC_CODES.ChangelogVersion));
    assert.ok(codes.has(PUBLIC_SURFACE_DIAGNOSTIC_CODES.SiteVersion));
    assert.ok(codes.has(PUBLIC_SURFACE_DIAGNOSTIC_CODES.SiteAgents));
    assert.ok(codes.has(PUBLIC_SURFACE_DIAGNOSTIC_CODES.SiteSkills));
    assert.ok(diagnostics.some((diagnostic) => /brand-reviewer/.test(diagnostic.message)));
  } finally {
    cleanup(root);
  }
});

function createFixture(overrides: Partial<Record<"readme" | "site" | "changelog", string>> = {}): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "public-surfaces-"));
  fs.mkdirSync(path.join(root, ".claude", "agents"), { recursive: true });
  fs.mkdirSync(path.join(root, ".claude", "skills", "orchestrate"), { recursive: true });
  fs.mkdirSync(path.join(root, ".claude", "skills", "verify"), { recursive: true });
  fs.mkdirSync(path.join(root, "docs"), { recursive: true });
  fs.mkdirSync(path.join(root, "sites"), { recursive: true });

  fs.writeFileSync(path.join(root, "package.json"), JSON.stringify({ version: "0.5.0" }), "utf8");
  fs.writeFileSync(path.join(root, ".claude", "agents", "analyst.md"), "# analyst\n", "utf8");
  fs.writeFileSync(path.join(root, ".claude", "agents", "brand-reviewer.md"), "# brand-reviewer\n", "utf8");
  fs.writeFileSync(path.join(root, ".claude", "agents", "README.md"), "# agents\n", "utf8");
  fs.writeFileSync(path.join(root, ".claude", "skills", "orchestrate", "SKILL.md"), "# orchestrate\n", "utf8");
  fs.writeFileSync(path.join(root, ".claude", "skills", "verify", "SKILL.md"), "# verify\n", "utf8");

  fs.writeFileSync(
    path.join(root, "README.md"),
    overrides.readme ||
      "# Specorator\n\n![Version](https://img.shields.io/badge/version-v0.5.0-blue)\n\n> **Status:** v0.5.0\n",
    "utf8",
  );
  fs.writeFileSync(path.join(root, "docs", "specorator.md"), "**Version:** 0.5.0\n", "utf8");
  fs.writeFileSync(
    path.join(root, "CHANGELOG.md"),
    overrides.changelog || "# Changelog\n\n## [v0.5.0]\n\n## [v0.4.0]\n\n## [v0.3.0]\n",
    "utf8",
  );
  fs.writeFileSync(
    path.join(root, "sites", "index.html"),
    overrides.site ||
      "<html><body>v0.5.0 2 agents 2 skills <code>analyst</code><code>brand-reviewer</code></body></html>",
    "utf8",
  );

  return root;
}

function cleanup(root: string) {
  fs.rmSync(root, { recursive: true, force: true });
}
