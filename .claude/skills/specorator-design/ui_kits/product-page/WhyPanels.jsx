// WhyPanels.jsx — Problem / Solution two-up
function WhyPanels() {
  return (
    <section className="section" aria-labelledby="why-title">
      <div className="split">
        <article className="panel problem">
          <p className="eyebrow">The problem</p>
          <h2 id="why-title">AI coding tools often start in the wrong place.</h2>
          <p>Most assistants jump straight to implementation. That can produce code quickly, but it also bakes in unclear requirements, missing decisions, and late-stage rework.</p>
        </article>
        <article className="panel solution">
          <p className="eyebrow">The product</p>
          <h2>Specs first, code second.</h2>
          <p>Specorator turns software work into staged artifacts, specialist roles, quality gates, and traceable decisions so agents can move fast without guessing what humans meant.</p>
        </article>
      </div>
    </section>
  );
}
window.WhyPanels = WhyPanels;
