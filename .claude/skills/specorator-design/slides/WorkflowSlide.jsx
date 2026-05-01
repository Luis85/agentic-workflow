// WorkflowSlide.jsx — Discovery + Lifecycle stage rails
const WF_DISCOVERY = [
  ["Frame", "product-strategist"],
  ["Diverge", "divergent-thinker"],
  ["Converge", "critic"],
  ["Prototype", "prototyper"],
  ["Validate", "user-researcher"],
  ["Brief gate", "human"],
];
const WF_LIFECYCLE = [
  ["1. Idea", "analyst"],
  ["2. Research", "analyst"],
  ["3. Requirements", "pm"],
  ["4. Design", "ux/ui/architect"],
  ["5. Specification", "architect"],
  ["6. Tasks", "planner"],
  ["7. Implementation", "dev"],
  ["8. Testing", "qa"],
  ["9. Review", "reviewer"],
  ["10. Release", "release-manager"],
  ["11. Retro", "retrospective"],
];

function WfStage({ name, owner, kind }) {
  const bg = kind === "discovery" ? "var(--soft-green)" : kind === "gate" ? "var(--soft-yellow)" : "var(--soft-blue)";
  const fg = kind === "discovery" ? "var(--accent-strong)" : kind === "gate" ? "#8a6309" : "#22397a";
  return (
    <div style={{
      background: bg,
      borderRadius: 8,
      padding: "16px 18px",
      flex: "1 1 0",
      minWidth: 0,
      display: "flex",
      flexDirection: "column",
      gap: 6,
    }}>
      <span style={{fontWeight: 760, fontSize: 19, color: "var(--ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"}}>{name}</span>
      <span className="mono" style={{fontSize: 14, color: fg, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"}}>{owner}</span>
    </div>
  );
}

function WorkflowSlide() {
  return (
    <section data-screen-label="03 Workflow rails" className="bg-paper">
      <SlideCorner kicker="WORKFLOW · 03 / 06" />
      <div className="slide-pad" style={{paddingTop: 140, paddingBottom: 140}}>
        <Eyebrow>Two tracks, one source of truth</Eyebrow>
        <h2 className="h-title" style={{maxWidth: 1500, marginBottom: 24, fontSize: 80}}>
          Discovery creates the brief. The lifecycle ships it.
        </h2>
        <p className="lead" style={{marginBottom: 64}}>
          Each stage produces an artifact, passes a quality gate, and hands off cleanly to the next.
        </p>

        <div style={{display: "flex", flexDirection: "column", gap: 36}}>
          <div>
            <div style={{display: "flex", alignItems: "baseline", gap: 18, marginBottom: 16}}>
              <span style={{fontSize: 24, fontWeight: 800}}>Discovery</span>
              <span className="mono" style={{fontSize: 14, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em"}}>optional</span>
            </div>
            <div style={{display: "flex", gap: 12}}>
              {WF_DISCOVERY.map(([n, o]) => (
                <WfStage key={n} name={n} owner={o} kind={n === "Brief gate" ? "gate" : "discovery"} />
              ))}
            </div>
          </div>
          <div>
            <div style={{display: "flex", alignItems: "baseline", gap: 18, marginBottom: 16}}>
              <span style={{fontSize: 24, fontWeight: 800}}>Lifecycle</span>
              <span className="mono" style={{fontSize: 14, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em"}}>11 stages</span>
            </div>
            <div style={{display: "flex", gap: 12}}>
              {WF_LIFECYCLE.map(([n, o]) => <WfStage key={n} name={n} owner={o} kind="lifecycle" />)}
            </div>
          </div>
        </div>
      </div>
      <SlideFoot left={<BrandMini />} right={<span>03 / 06</span>} />
    </section>
  );
}
window.WorkflowSlide = WorkflowSlide;
