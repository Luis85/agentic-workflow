// RepoGrid.jsx — what's in the repo
const REPO = [
  [".claude/",   "Claude Code agents, commands, skills, and operational prompts."],
  [".codex/",    "Codex-specific delivery workflows for worktrees, verification, PRs, and cleanup."],
  ["docs/",      "The Specorator method, quality gates, how-to recipes, ADRs, and steering context."],
  ["templates/", "Reusable Markdown artifact shapes for requirements, design, tasks, tests, release readiness, and release."],
  ["specs/",     "Per-feature state and traceable artifacts produced as work moves through the lifecycle."],
  ["sites/",     "The public product page source, kept directly openable and deployable as static files."],
];

function RepoGrid() {
  return (
    <section className="section repo-section" id="repo" aria-labelledby="repo-title">
      <div className="section-header">
        <h2 id="repo-title">What you get in the repository.</h2>
        <p className="section-kicker">The repo is the product: prompts, workflows, templates, checks, and examples that make agentic delivery repeatable.</p>
      </div>
      <div className="repo-grid" aria-label="Repository contents">
        {REPO.map(([code, body]) => (
          <article key={code} className="repo-item">
            <code>{code}</code>
            <p>{body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
window.RepoGrid = RepoGrid;
