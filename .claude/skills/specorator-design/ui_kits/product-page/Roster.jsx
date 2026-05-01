// Roster.jsx — dark section, all 30 agents
const ROSTER = [
  { title: "Build a feature", count: "13 agents", desc: "The 11-stage lifecycle, the conductor that drives it, and ops support.",
    agents: ["analyst","pm","ux-designer","ui-designer","architect","planner","dev","qa","reviewer","release-manager","retrospective","sre","orchestrator"] },
  { title: "Run a discovery sprint", count: "7 agents", desc: "Frame to validate, before a brief exists.",
    agents: ["facilitator","product-strategist","user-researcher","game-designer","divergent-thinker","critic","prototyper"] },
  { title: "Audit a legacy system", count: "1 agent", desc: "Inventory what's already there before changing anything.",
    agents: ["legacy-auditor"] },
  { title: "Win a deal", count: "4 agents", desc: "Service-provider opt-in: qualify to order.",
    agents: ["sales-qualifier","scoping-facilitator","estimator","proposal-writer"] },
  { title: "Govern delivery", count: "4 agents", desc: "Project, portfolio, roadmap, and source-led onboarding.",
    agents: ["project-manager","portfolio-manager","roadmap-manager","project-scaffolder"] },
  { title: "Maintain the kit", count: "1 agent", desc: "Keeps the public product page current.",
    agents: ["product-page-designer"] },
];

function Roster() {
  return (
    <section className="section dark roster-section" id="roster" aria-labelledby="roster-title">
      <div className="section-header">
        <h2 id="roster-title">All 30 agents in the repo.</h2>
        <p className="section-kicker">The eight roles above are how the team thinks. Here&rsquo;s every agent the workflow actually ships, grouped by what it helps you do.</p>
      </div>
      <div className="roster-grid" aria-label="Full agent roster">
        {ROSTER.map(g => (
          <article key={g.title} className="roster-group">
            <header><h3>{g.title}</h3><span className="roster-count">{g.count}</span></header>
            <p className="roster-desc">{g.desc}</p>
            <ul className="roster-list">{g.agents.map(a => <li key={a}><code>{a}</code></li>)}</ul>
          </article>
        ))}
      </div>
    </section>
  );
}
window.Roster = Roster;
