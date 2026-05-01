// FitGrid.jsx — Good fit / Probably too much
function FitGrid() {
  return (
    <section className="section fit-section" id="fit" aria-labelledby="fit-title">
      <div className="section-header">
        <h2 id="fit-title">Use it when the work needs memory.</h2>
        <p className="section-kicker">Specorator is for work where context, decisions, and review history matter more than a one-shot code answer.</p>
      </div>
      <div className="fit-grid">
        <article className="fit-panel good-fit">
          <h3>Good fit</h3>
          <ul className="fit-list">
            <li>Features with unclear requirements or multiple stakeholders.</li>
            <li>Projects where AI agents need bounded roles and durable hand-offs.</li>
            <li>Teams that want traceability from requirement to test to PR.</li>
            <li>Long-lived products where decisions should survive the chat window.</li>
          </ul>
        </article>
        <article className="fit-panel poor-fit">
          <h3>Probably too much</h3>
          <ul className="fit-list">
            <li>Throwaway scripts, tiny bug fixes, or one-person spikes.</li>
            <li>Work where the correct behavior is already fully specified elsewhere.</li>
            <li>Teams that need only a prompt library, not a delivery workflow.</li>
            <li>Situations where no one will maintain the specs after the first pass.</li>
          </ul>
        </article>
      </div>
    </section>
  );
}
window.FitGrid = FitGrid;
