// Hero.jsx — title + lead + CTAs + proof + workflow art
function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div>
        <p className="eyebrow">
          <span className="status-pill">Open-source template</span>
          <span className="eyebrow-meta">MIT &middot; the <code>agentic-workflow</code> repo</span>
        </p>
        <h1 id="hero-title">Stop letting AI write the wrong code.</h1>
        <p className="hero-copy">
          Most AI assistants jump straight to typing. <strong>Specorator</strong> flips it &mdash; specs first, code second. You decide <em>what</em> to build; specialist agents handle <em>how</em>; every decision stays traceable.
        </p>
        <div className="hero-actions" aria-label="Primary actions">
          <a className="button highlight" href="#start">Get started</a>
          <a className="button secondary" href="https://github.com/Luis85/agentic-workflow/blob/main/docs/specorator.md">Read the workflow</a>
        </div>
        <div className="hero-proof" aria-label="At a glance">
          <span className="proof-item">
            <span className="proof-value">11</span>
            <span className="proof-label">stages, idea&nbsp;&rarr;&nbsp;retro</span>
          </span>
          <span className="proof-item">
            <span className="proof-value">10</span>
            <span className="proof-label">conductor skills, pick your fit</span>
          </span>
          <span className="proof-item">
            <span className="proof-value">6+</span>
            <span className="proof-label">AI coding tools supported</span>
          </span>
        </div>
      </div>
      <figure className="hero-visual">
        <img src="../../assets/specorator-workflow.svg" alt="Specorator workflow showing discovery, lifecycle stages, quality gates, and traceability." />
      </figure>
    </section>
  );
}
window.Hero = Hero;
