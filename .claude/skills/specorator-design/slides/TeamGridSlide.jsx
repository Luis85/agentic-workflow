// TeamGridSlide.jsx — 8 lane-coded team cards
const TEAM_SLIDE = [
  ["01", "define", "Analyst", "analyst", "Frames the problem; runs idea capture and research."],
  ["02", "define", "Product Manager", "pm", "Owns EARS-format requirements and scope."],
  ["03", "define", "Designer", "ux-designer · ui-designer", "Flows, IA, tokens, microcopy."],
  ["04", "define", "Architect", "architect", "Files ADRs; produces implementation-ready spec."],
  ["05", "build",  "Planner", "planner", "Breaks the spec into TDD-ordered tasks."],
  ["06", "build",  "Developer", "dev", "Implements with TDD discipline; never invents requirements."],
  ["07", "build",  "QA", "qa", "Test plan + suite; every EARS clause has a test."],
  ["08", "ship",   "Reviewer & Release", "reviewer · release-manager · retrospective", "Diff review, release readiness, mandatory retro."],
];
const LANE_LABEL_S = { define: "Define", build: "Build", ship: "Ship" };
const LANE_FG = { define: "var(--lane-define)", build: "var(--lane-build)", ship: "var(--lane-ship)" };

function TeamGridSlide() {
  return (
    <section data-screen-label="04 Team grid" className="bg-surface2">
      <SlideCorner kicker="TEAM · 04 / 06" />
      <div className="slide-pad" style={{paddingTop: 160}}>
        <Eyebrow>Eight role families</Eyebrow>
        <h2 className="h-title" style={{maxWidth: 1500, marginBottom: 56}}>
          A specialist for every stage.
        </h2>

        <div style={{display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 22, flex: 1}}>
          {TEAM_SLIDE.map(([num, lane, title, agents, desc]) => (
            <article key={num} style={{
              background: "var(--surface)",
              border: "1px solid var(--line)",
              borderTop: `4px solid ${LANE_FG[lane]}`,
              borderRadius: 12,
              padding: "28px 28px 32px",
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}>
              <header style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                <span className="mono" style={{fontSize: 18, fontWeight: 800, color: "var(--ink)"}}>{num}</span>
                <span className={`lane-chip lane-${lane}`} style={{fontSize: 12, padding: "6px 12px"}}>{LANE_LABEL_S[lane]}</span>
              </header>
              <h3 style={{fontSize: 28, fontWeight: 760, lineHeight: 1.1, letterSpacing: "-0.01em"}}>{title}</h3>
              <code className="mono" style={{fontSize: 16, color: "var(--accent-strong)", background: "rgba(23,32,27,0.06)", padding: "4px 8px", borderRadius: 6, alignSelf: "flex-start"}}>{agents}</code>
              <p style={{fontSize: 18, lineHeight: 1.45, color: "var(--muted)", marginTop: 4}}>{desc}</p>
            </article>
          ))}
        </div>
      </div>
      <SlideFoot left={<BrandMini />} right={<span>04 / 06</span>} />
    </section>
  );
}
window.TeamGridSlide = TeamGridSlide;
