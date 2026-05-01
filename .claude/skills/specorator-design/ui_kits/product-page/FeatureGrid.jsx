// FeatureGrid.jsx — Dark section, 9 feature cards
const FEATURES = [
  ["11-stage lifecycle", "Idea, research, requirements, design, specification, tasks, implementation, testing, review, release, and retrospective."],
  ["Discovery track", "Frame, diverge, converge, prototype, validate, and hand off before a feature brief exists."],
  ["Specialist agents", "PM, design, architecture, development, QA, review, release, and operations roles stay in their lane."],
  ["Quality gates", "Each stage has acceptance criteria so defects are caught where they are cheapest to fix."],
  ["Release readiness", "Stage 10 can collect product perspectives, stakeholder approvals, conditions, and go/no-go evidence before production."],
  ["Traceability", "Requirements, specs, tasks, code, tests, and findings use stable IDs and link back to source intent."],
  ["Worktree discipline", "Topic branches live in isolated worktrees, pass verify, and move through PR review before merge."],
  ["Operational bots", "Review, docs, plan reconciliation, dependency triage, and Actions updates can be automated over time."],
  ["Tool-agnostic core", "Claude Code gets first-class commands, while Codex, Cursor, Aider, Copilot, and other tools can follow AGENTS.md."],
];

function FeatureGrid() {
  return (
    <section className="section dark" id="features" aria-labelledby="features-title">
      <div className="section-header">
        <h2 id="features-title">A workflow that gives agents structure.</h2>
        <p className="section-kicker">Clone or fork it, adapt the steering docs, and let every feature move through the same visible path.</p>
      </div>
      <div className="feature-grid">
        {FEATURES.map(([title, body]) => (
          <article className="card" key={title}>
            <h3>{title}</h3>
            <p>{body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
window.FeatureGrid = FeatureGrid;
