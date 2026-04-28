export const artifactStatuses = new Set(["pending", "in-progress", "complete", "skipped", "blocked"]);

export const workflowStages = new Set([
  "idea",
  "research",
  "requirements",
  "design",
  "specification",
  "tasks",
  "implementation",
  "testing",
  "review",
  "release",
  "learning",
]);

export const workflowStatuses = new Set(["active", "blocked", "paused", "done"]);

export const stageArtifacts = [
  ["idea", ["idea.md"]],
  ["research", ["research.md"]],
  ["requirements", ["requirements.md"]],
  ["design", ["design.md"]],
  ["specification", ["spec.md"]],
  ["tasks", ["tasks.md"]],
  ["implementation", ["implementation-log.md"]],
  ["testing", ["test-plan.md", "test-report.md"]],
  ["review", ["review.md", "traceability.md"]],
  ["release", ["release-notes.md"]],
  ["learning", ["retrospective.md"]],
] as const;

export const canonicalArtifacts = stageArtifacts.flatMap(([, artifacts]) => artifacts);
export const artifactSet = new Set<string>(canonicalArtifacts);

export const workflowArtifacts = [
  "idea.md",
  "research.md",
  "requirements.md",
  "design.md",
  "spec.md",
  "tasks.md",
  "implementation-log.md",
  "test-plan.md",
  "test-report.md",
  "review.md",
  "traceability.md",
];

export const requiredWorkflowStateSections = [
  "Stage progress",
  "Skips",
  "Blocks",
  "Hand-off notes",
  "Open clarifications",
];

export const traceabilityIdPattern =
  /\b(IDEA|RESEARCH|PRD|REQ|NFR|DESIGN|SPECDOC|SPEC|TASKS|T|IMPL-LOG|TESTPLAN|TESTREPORT|TEST|REVIEW|R|RTM|RELEASE|RETRO|CHECKLIST)-([A-Z][A-Z0-9]*)-(\d{3})\b/g;

export const traceabilityIdDefinitionPattern =
  /^(IDEA|RESEARCH|PRD|REQ|NFR|DESIGN|SPECDOC|SPEC|TASKS|T|IMPL-LOG|TESTPLAN|TESTREPORT|TEST|REVIEW|R|RTM|RELEASE|RETRO|CHECKLIST)-([A-Z][A-Z0-9]*)-(\d{3})$/;

export const traceabilityItemHeadingPattern =
  /^(#{2,4})\s+((REQ|NFR|SPEC|T|TEST)-([A-Z][A-Z0-9]*)-(\d{3}))\b/gm;

export const traceabilityTableItemPattern =
  /^\|\s*((REQ|NFR|SPEC|T|TEST)-([A-Z][A-Z0-9]*)-(\d{3}))\s*\|/gm;
