// Workflow.jsx — discovery + lifecycle rails
const DISCOVERY = [
  ["Frame", "product-strategist", "discovery"],
  ["Diverge", "divergent-thinker", "discovery"],
  ["Converge", "critic", "discovery"],
  ["Prototype", "prototyper", "discovery"],
  ["Validate", "user-researcher", "discovery"],
  ["Brief gate", "human", "gate"],
];
const LIFECYCLE = [
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
  ["11. Retrospective", "retrospective"],
];

function Stage({ name, owner, kind }) {
  return (
    <span className={`stage ${kind || "lifecycle"}`}>
      <span className="stage-name">{name}</span>
      <span className="stage-owner">{owner}</span>
    </span>
  );
}

function Workflow() {
  return (
    <section className="section" id="workflow" aria-labelledby="workflow-title">
      <div className="section-header">
        <h2 id="workflow-title">Two tracks, one source of truth.</h2>
        <p className="section-kicker">Discovery creates the brief. The lifecycle turns it into tested, reviewed, releasable work.</p>
      </div>
      <div className="workflow" aria-label="Specorator workflow stages">
        <div className="workflow-row">
          <div className="workflow-label">Discovery <span className="workflow-label-meta">optional</span></div>
          <div className="workflow-stages discovery-stages">
            {DISCOVERY.map(([n, o, k]) => <Stage key={n} name={n} owner={o} kind={k} />)}
          </div>
        </div>
        <div className="workflow-row">
          <div className="workflow-label">Lifecycle <span className="workflow-label-meta">11 stages</span></div>
          <div className="workflow-stages lifecycle-stages">
            {LIFECYCLE.map(([n, o]) => <Stage key={n} name={n} owner={o} kind="lifecycle" />)}
          </div>
        </div>
      </div>
    </section>
  );
}
window.Workflow = Workflow;
