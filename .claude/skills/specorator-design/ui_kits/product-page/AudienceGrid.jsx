// AudienceGrid.jsx — 4 cards with big numeral watermark
const AUDIENCES = [
  { num: "01", title: "Product managers & designers", body: "Run discovery, shape requirements, review designs, and keep intent explicit. No code required.", say: "You'd say", cta: "\u201clet's start a feature: user auth\u201d" },
  { num: "02", title: "Developers", body: "Implement from clear task specs with TDD discipline. No more reverse-engineering stakeholder intent from a Slack thread.", say: "You'd say", cta: "\u201ccontinue the user-auth feature\u201d" },
  { num: "03", title: "Team leads", body: "Coordinate humans and agents across a release cycle with visible gates, owned artifacts, and quality checks you can enforce.", say: "You'd type", cta: "/adr:new \"Switch to Postgres\"" },
  { num: "04", title: "Solo builders", body: "Run the entire workflow yourself. Specialist agents fill every role \u2014 analyst, architect, dev, QA \u2014 while you keep the vision.", say: "You'd say", cta: "\u201cdrive this end-to-end: magic-link login\u201d" },
];

function AudienceGrid() {
  return (
    <section className="section" aria-labelledby="audience-title">
      <div className="section-header">
        <h2 id="audience-title">Built for the people who share delivery work.</h2>
        <p className="section-kicker">The repository gives each role an entry point without turning the process into a separate product to maintain.</p>
      </div>
      <div className="audience-grid">
        {AUDIENCES.map(a => (
          <article key={a.num} className="audience-card" data-num={a.num}>
            <h3>{a.title}</h3>
            <p>{a.body}</p>
            <p className="audience-say">{a.say}</p>
            <code className="audience-cta">{a.cta}</code>
          </article>
        ))}
      </div>
    </section>
  );
}
window.AudienceGrid = AudienceGrid;
