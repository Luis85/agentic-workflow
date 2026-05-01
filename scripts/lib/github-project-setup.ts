import { spawnSync } from "node:child_process";

export type ProjectSetupProfile = "generic-product" | "obsidian-plugin";

export type ProjectSetupInput = {
  projectName: string;
  profile: ProjectSetupProfile;
  includeP3: boolean;
};

export type GitHubLabelSpec = {
  name: string;
  color: string;
  description: string;
};

export type GitHubMilestoneSpec = {
  title: string;
  description: string;
};

export type GitHubIssueSpec = {
  title: string;
  body: string;
  labels: string[];
  milestone: string;
};

export type GitHubProjectSetupPlan = {
  labels: GitHubLabelSpec[];
  milestones: GitHubMilestoneSpec[];
  issues: GitHubIssueSpec[];
};

const baseLabels: GitHubLabelSpec[] = [
  { name: "setup", color: "0E8A16", description: "Repository setup and project foundations" },
  { name: "github", color: "5319E7", description: "GitHub configuration, templates, and collaboration workflow" },
  { name: "ci", color: "1D76DB", description: "Continuous integration and automated checks" },
  { name: "release", color: "FBCA04", description: "Versioning, packaging, and release automation" },
  { name: "product", color: "0E8A16", description: "Product strategy, vision, PRD, and scope" },
  { name: "prd", color: "BFDADC", description: "Product requirements documents" },
  { name: "use-cases", color: "F9D0C4", description: "Use cases, scenarios, and user workflows" },
  { name: "ux-research", color: "D4C5F9", description: "User research, personas, journeys, and UX inputs" },
  { name: "architecture", color: "C5DEF5", description: "Architecture decisions and system boundaries" },
  { name: "ui", color: "D4C5F9", description: "User interface and frontend application work" },
  { name: "testing", color: "006B75", description: "Tests, test harnesses, and verification strategy" },
  { name: "traceability", color: "C2E0C6", description: "Requirement IDs, mappings, and acceptance traceability" },
  { name: "documentation", color: "0075CA", description: "Improvements or additions to documentation" },
  { name: "pages", color: "0366D6", description: "GitHub Pages and public site work" },
];

const p3Labels: GitHubLabelSpec[] = [
  { name: "p3-express", color: "0052CC", description: "P3.express project management activities" },
  { name: "project-management", color: "5319E7", description: "Project governance, coordination, decision gates, and registers" },
  { name: "governance", color: "B60205", description: "Roles, decisions, approvals, and management controls" },
  { name: "risk", color: "D93F0B", description: "Risks, issues, responses, and follow-up actions" },
  { name: "decision-gate", color: "FBCA04", description: "Go/no-go gates and approval checkpoints" },
];

const pluginLabels: GitHubLabelSpec[] = [
  { name: "plugin-shell", color: "BFD4F2", description: "Plugin shell architecture and foundation" },
  { name: "tooling", color: "FEF2C0", description: "Developer tooling, linting, formatting, and documentation generation" },
  { name: "marketplace", color: "F9D0C4", description: "Marketplace readiness and packaging requirements" },
];

/**
 * Build a GitHub-native project setup plan for a new product repository.
 *
 * @param input - Product name, project profile, and governance options.
 * @returns Labels, milestones, and issues to create in GitHub.
 */
export function buildGitHubProjectSetupPlan(input: ProjectSetupInput): GitHubProjectSetupPlan {
  const labels = dedupeLabels([...baseLabels, ...(input.includeP3 ? p3Labels : []), ...(input.profile === "obsidian-plugin" ? pluginLabels : [])]);
  const milestones = [
    {
      title: "v1 repo setup",
      description: "Repository and GitHub work environment needed before product development starts.",
    },
    {
      title: "v1 product setup",
      description: "Product vision, PRDs, use cases, UX/design inputs, architecture inputs, and traceability baseline.",
    },
    ...(input.profile === "obsidian-plugin"
      ? [
          {
            title: "v1 plugin shell",
            description: "Plugin architecture, tooling, isolated UI shell, and marketplace-ready foundations before feature development.",
          },
        ]
      : []),
    ...(input.includeP3
      ? [
          {
            title: "P3 project initiation",
            description: "P3.express A01-A09 project initiation activities up to kickoff, plus startup communication planning.",
          },
        ]
      : []),
  ];

  return {
    labels,
    milestones,
    issues: [
      ...repoSetupIssues(input),
      ...productSetupIssues(input),
      ...(input.profile === "obsidian-plugin" ? pluginShellIssues(input) : []),
      ...(input.includeP3 ? p3InitiationIssues(input) : []),
    ],
  };
}

/**
 * Render a project setup plan as Markdown for review or dry-run output.
 *
 * @param plan - GitHub setup plan.
 * @returns Markdown summary.
 */
export function renderGitHubProjectSetupPlan(plan: GitHubProjectSetupPlan): string {
  return [
    "# GitHub Project Setup Plan",
    "",
    "## Labels",
    ...plan.labels.map((label) => `- \`${label.name}\` - ${label.description}`),
    "",
    "## Milestones",
    ...plan.milestones.map((milestone) => `- \`${milestone.title}\` - ${milestone.description}`),
    "",
    "## Issues",
    ...plan.issues.map((issue) => `- \`${issue.milestone}\` / ${issue.title}`),
    "",
  ].join("\n");
}

/**
 * Apply a project setup plan to a GitHub repository with the GitHub CLI.
 *
 * Existing labels are updated only when the local `gh label create` command
 * supports `--force`; otherwise existing labels are left in place.
 *
 * @param repo - Repository in `owner/name` form.
 * @param plan - Project setup plan to create.
 */
export function applyGitHubProjectSetupPlan(repo: string, plan: GitHubProjectSetupPlan): void {
  for (const label of plan.labels) {
    runGh(["label", "create", label.name, "--repo", repo, "--color", label.color, "--description", label.description, "--force"]);
  }
  for (const milestone of plan.milestones) {
    runGh(["api", `repos/${repo}/milestones`, "-f", `title=${milestone.title}`, "-f", `description=${milestone.description}`]);
  }
  for (const issue of plan.issues) {
    runGh([
      "issue",
      "create",
      "--repo",
      repo,
      "--title",
      issue.title,
      "--body",
      issue.body,
      "--label",
      issue.labels.join(","),
      "--milestone",
      issue.milestone,
    ]);
  }
}

function runGh(args: string[]): void {
  const result = spawnSync("gh", args, { stdio: "inherit", windowsHide: true });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`gh ${args.join(" ")} failed with status ${result.status}`);
  }
}

function repoSetupIssues(input: ProjectSetupInput): GitHubIssueSpec[] {
  return [
    issue("v1 repo setup", "Objective: make the GitHub work environment ready for development", ["setup", "github"], [
      "## Objective",
      "",
      `Prepare the ${input.projectName} GitHub repository so product development can start smoothly once the setup backlog is complete.`,
      "",
      "## Deliverables",
      "",
      "- Repository identity, README, license, and contribution docs.",
      "- Issue and pull request templates.",
      "- Labels, milestones, and project-management conventions.",
      "- CI verification workflow.",
      "- Release/package workflow.",
      "- Dependency and security maintenance.",
      "- Local development documentation.",
      "- GitHub Pages product entry point.",
      "",
      "## Acceptance Criteria",
      "",
      "- Contributors can clone, install, verify, and open a PR from documented instructions.",
      "- Issues and PRs collect the information needed for planning and review.",
      "- GitHub milestones and labels reflect the product setup model.",
      "- The public README links to product, engineering, and contribution entry points.",
    ]),
    issue("v1 repo setup", "Add repository identity, README, license, and baseline documentation", ["setup", "documentation"], [
      "## Goal",
      "",
      "Give the repository a clear public identity and enough baseline documentation for collaborators to understand the product and how work happens.",
      "",
      "## Acceptance Criteria",
      "",
      "- README explains the product, status, and development entry points.",
      "- License and contribution expectations are visible from the repository root.",
      "- README links to product vision, PRDs, use cases, product page, and development docs once available.",
    ]),
    issue("v1 repo setup", "Set up GitHub issue templates, PR template, labels, and milestone conventions", ["setup", "github", "documentation"], [
      "## Goal",
      "",
      "Make GitHub usable as the planning and review workspace before implementation begins.",
      "",
      "## Acceptance Criteria",
      "",
      "- Issue templates exist for product tasks, bugs, feature requests, decisions, and setup work.",
      "- PR template asks for summary, linked issue, verification, screenshots when UI changes, and risks.",
      "- Label and milestone conventions are documented.",
    ]),
    issue("v1 repo setup", "Configure GitHub Projects, repository features, and management views", ["setup", "github", "project-management"], [
      "## Goal",
      "",
      "Use GitHub-native features to make the project manageable beyond a flat issue list.",
      "",
      "## Scope",
      "",
      "- Decide whether to enable GitHub Projects, Discussions, Wiki, and repository Pages.",
      "- Create or document a GitHub Project board with views for setup, product, delivery, risk, and decisions.",
      "- Define fields such as status, priority, product perspective, milestone, owner, risk level, and target release.",
      "- Document how issues, milestones, PRs, releases, and project views work together.",
      "- Confirm branch protection and required checks are configured or documented.",
      "",
      "## Acceptance Criteria",
      "",
      "- Contributors have a project view for current work, upcoming work, risks, and decision gates.",
      "- Repo feature settings match the collaboration model.",
      "- The README or contributor docs explain how to use the GitHub workspace.",
    ]),
    issue("v1 repo setup", "Add CI, release, dependency, and branch-protection readiness", ["setup", "ci", "release", "github"], [
      "## Goal",
      "",
      "Create the automation and branch policy needed for safe collaboration.",
      "",
      "## Acceptance Criteria",
      "",
      "- CI runs on pull requests.",
      "- Release/package expectations are documented or automated.",
      "- Dependency update cadence is configured.",
      "- Branch protection or manual branch policy is documented.",
    ]),
    issue("v1 repo setup", "Create GitHub Pages product page", ["setup", "documentation", "pages"], [
      "## Goal",
      "",
      "Create a public product page hosted on GitHub Pages that explains the product and gives users a fast path to get started.",
      "",
      "## Acceptance Criteria",
      "",
      "- A public GitHub Pages URL exists.",
      "- README links to the product page.",
      "- The page explains current capabilities and planned direction without overpromising.",
    ]),
  ];
}

function productSetupIssues(input: ProjectSetupInput): GitHubIssueSpec[] {
  return [
    issue("v1 product setup", "Objective: establish the product setup baseline", ["product", "setup", "documentation"], [
      "## Objective",
      "",
      `Create the product setup baseline for ${input.projectName} so engineering, design, architecture, documentation, and release planning can work from shared source material.`,
      "",
      "## Required Deliverables",
      "",
      "- `PRODUCT_VISION.md`.",
      "- v1 PRD.",
      "- Later-version PRD or roadmap PRD.",
      "- Use case catalog extracted from PRDs.",
      "- UX/design brief and interaction principles.",
      "- Architecture input brief.",
      "- Requirement and traceability index.",
      "- Product glossary.",
    ]),
    issue("v1 product setup", "Create PRODUCT_VISION.md", ["product", "documentation"], [
      "## Goal",
      "",
      "Create a durable product north star that defines audience, problem, positioning, principles, outcomes, risks, and success signals.",
      "",
      "## Acceptance Criteria",
      "",
      "- Product vision exists in the repo and is linked from the README.",
      "- It can guide PRDs, design briefs, architecture decisions, product page copy, and release planning.",
    ]),
    issue("v1 product setup", "Create v1 PRD", ["product", "prd", "documentation"], [
      "## Goal",
      "",
      "Translate the v1 planning scope into requirements that engineering, UX, design, documentation, and QA can use.",
      "",
      "## Acceptance Criteria",
      "",
      "- Requirements use stable IDs.",
      "- Goals, non-goals, functional requirements, non-functional requirements, UX needs, and acceptance criteria are covered.",
      "- The PRD is specific enough to extract use cases and engineering tasks.",
    ]),
    issue("v1 product setup", "Extract and catalog use cases from the PRDs", ["product", "use-cases", "traceability"], [
      "## Goal",
      "",
      "Translate PRD requirements into concrete user workflows and system interactions.",
      "",
      "## Acceptance Criteria",
      "",
      "- Use cases have stable IDs.",
      "- Use cases trace to PRD requirement IDs.",
      "- Architecture, UI design, QA, and documentation can use the catalog without reinterpreting the PRD.",
    ]),
    issue("v1 product setup", "Create UX/design brief and architecture input brief", ["product", "ui", "ux-research", "architecture"], [
      "## Goal",
      "",
      "Create handoff material for design and architecture before implementation begins.",
      "",
      "## Acceptance Criteria",
      "",
      "- UX/design brief covers journeys, states, interaction principles, and open questions.",
      "- Architecture input brief maps requirements and use cases to architecture-driving concerns.",
    ]),
    issue("v1 product setup", "Create requirements traceability index", ["product", "traceability", "testing"], [
      "## Goal",
      "",
      "Connect product vision, PRDs, use cases, design inputs, architecture inputs, engineering tasks, and QA checks.",
      "",
      "## Acceptance Criteria",
      "",
      "- ID conventions are documented.",
      "- Requirements trace to use cases and planned tests.",
      "- Contributors know where to add new mappings.",
    ]),
  ];
}

function pluginShellIssues(input: ProjectSetupInput): GitHubIssueSpec[] {
  return [
    issue("v1 plugin shell", "Objective: prepare a marketplace-ready plugin shell", ["plugin-shell", "architecture", "setup"], [
      "## Objective",
      "",
      `Prepare the ${input.projectName} plugin shell so feature development can start immediately once this milestone is complete.`,
      "",
      "## Acceptance Criteria",
      "",
      "- Plugin loads in its target host.",
      "- UI can run in isolation where applicable.",
      "- Host integration and UI code are separated by typed service boundaries.",
      "- Lint, typecheck, tests, docs, and build are wired into local scripts and CI.",
      "- Marketplace or distribution constraints are documented.",
    ]),
    issue("v1 plugin shell", "Create plugin architecture, UI shell, bridge API, tests, and docs", ["plugin-shell", "architecture", "ui", "testing", "tooling"], [
      "## Goal",
      "",
      "Create the technical foundation for sustained plugin development.",
      "",
      "## Acceptance Criteria",
      "",
      "- Repository layout separates host integration, UI, shared contracts, tests, and docs.",
      "- UI shell and browser/test harness are available.",
      "- Typed bridge/API boundary is documented and tested.",
    ]),
  ];
}

function p3InitiationIssues(input: ProjectSetupInput): GitHubIssueSpec[] {
  const prefix = "P3";
  return [
    p3(prefix, "A01", "appoint project sponsor and define governance authority", ["governance"], "Identify and record the sponsor role so decisions, approvals, and resource questions have a clear owner."),
    p3(prefix, "A02", "appoint project manager and project coordination model", ["governance"], "Define who coordinates project execution and how GitHub is used as the project management information system."),
    p3(prefix, "A03", "appoint key team roles for product, design, engineering, QA, and release", ["governance", "product"], "Identify roles needed to prepare and execute the project across all product perspectives."),
    p3(prefix, "A04", `create project description for ${input.projectName}`, ["product", "documentation"], "Create a concise project description with purpose, benefits, scope, quality expectations, stakeholders, and unknowns."),
    p3(prefix, "A05", "create deliverables map and GitHub milestone structure", ["product", "github"], "Create a hierarchy of deliverables and align it with milestones, issues, labels, and project views."),
    p3(prefix, "A06", "create follow-up register for risks, issues, assumptions, decisions, and change requests", ["risk", "governance"], "Create a GitHub-managed register for follow-up items with custodians and response actions."),
    p3(prefix, "A07", "peer review project initiation readiness", ["governance", "decision-gate"], "Review initiation readiness before the go/no-go decision and kickoff."),
    p3(prefix, "A08", "make project go/no-go decision", ["governance", "decision-gate"], "Record an explicit go, conditional-go, or no-go decision before kickoff."),
    p3(prefix, "A09", "plan and run project kickoff", ["governance"], "Prepare and run kickoff to align stakeholders around vision, scope, roles, deliverables, GitHub workflow, risks, and next actions."),
    p3(prefix, "A10", "prepare focused communication for project start", ["documentation", "github"], "Prepare startup communication for users, contributors, and stakeholders after kickoff."),
  ];
}

function p3(prefix: string, code: string, title: string, labels: string[], goal: string): GitHubIssueSpec {
  return issue("P3 project initiation", `${prefix} ${code}: ${title}`, ["p3-express", "project-management", ...labels], [
    "## P3.express Activity",
    "",
    `${code} - ${title}`,
    "",
    "## Goal",
    "",
    goal,
    "",
    "## Acceptance Criteria",
    "",
    "- The activity output is recorded in GitHub or repository docs.",
    "- Owners and follow-up actions are explicit.",
    "- The next initiation activity can proceed without hidden assumptions.",
  ]);
}

function issue(milestone: string, title: string, labels: string[], bodyLines: string[]): GitHubIssueSpec {
  return {
    title,
    labels,
    milestone,
    body: `${bodyLines.join("\n")}\n`,
  };
}

function dedupeLabels(labels: GitHubLabelSpec[]): GitHubLabelSpec[] {
  const byName = new Map<string, GitHubLabelSpec>();
  for (const label of labels) byName.set(label.name, label);
  return [...byName.values()].sort((a, b) => a.name.localeCompare(b.name));
}
