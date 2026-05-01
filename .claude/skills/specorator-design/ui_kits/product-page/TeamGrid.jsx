// TeamGrid.jsx — 8 lane-coded specialist role cards
const TEAM_ROLES = [
  { num: "01", lane: "define", title: "Analyst", agents: ["analyst"], desc: "Frames the problem. Runs idea capture, research, and discovery sprints. Produces the brief that seeds everything downstream." },
  { num: "02", lane: "define", title: "Product Manager", agents: ["pm"], desc: "Owns the requirements. Writes EARS-format specs, manages scope, and keeps intent sharp through the lifecycle." },
  { num: "03", lane: "define", title: "Designer", agents: ["ux-designer", "ui-designer"], desc: "Shapes the experience. UX produces flows, IA, and state coverage; UI picks tokens, components, and microcopy." },
  { num: "04", lane: "define", title: "Architect", agents: ["architect"], desc: "Designs the system. Makes structural decisions, files ADRs, and produces the implementation-ready spec." },
  { num: "05", lane: "build",  title: "Planner", agents: ["planner"], desc: "Breaks work down. Turns the spec into TDD-ordered tasks (\u00bd day each) with dependencies and definitions of done." },
  { num: "06", lane: "build",  title: "Developer", agents: ["dev"], desc: "Writes the code. Implements from task specs with TDD discipline. Never invents requirements; escalates if a gap appears." },
  { num: "07", lane: "build",  title: "QA", agents: ["qa"], desc: "Validates the build. Authors the test plan, runs the suite, and checks that every EARS clause has a matching test." },
  { num: "08", lane: "ship",   title: "Reviewer & Release", agents: ["reviewer", "release-manager", "retrospective"], desc: "Closes the loop. Reviews the diff with traceability, prepares release readiness, drafts release notes, and runs the mandatory retro." },
];
const LANE_LABEL = { define: "Define", build: "Build", ship: "Ship" };

function TeamGrid() {
  return (
    <section className="section team-section" id="team" aria-labelledby="team-title">
      <div className="section-header">
        <h2 id="team-title">A specialist for every stage.</h2>
        <p className="section-kicker">Eight role families backed by the agents in this repo. Each one owns a stage, produces an artifact, passes a quality gate, and hands off cleanly. You stay in charge of intent.</p>
      </div>
      <div className="team-grid" aria-label="Specialist roles">
        {TEAM_ROLES.map(r => (
          <article key={r.num} className="team-card" data-lane={r.lane}>
            <header className="team-card-head">
              <span className="team-num">{r.num}</span>
              <span className="team-lane">{LANE_LABEL[r.lane]}</span>
            </header>
            <h3>{r.title}</h3>
            <p className="team-agents">
              {r.agents.map((a, i) => (
                <React.Fragment key={a}>
                  {i > 0 && " \u00b7 "}
                  <code>{a}</code>
                </React.Fragment>
              ))}
            </p>
            <p className="team-desc">{r.desc}</p>
          </article>
        ))}
      </div>
      <p className="team-footnote">Plus an <code>orchestrator</code> that routes between them and an <code>sre</code> for post-release operability. <a href="#roster">See the full 30-agent roster &rarr;</a></p>
    </section>
  );
}
window.TeamGrid = TeamGrid;
