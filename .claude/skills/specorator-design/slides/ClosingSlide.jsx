// ClosingSlide.jsx — call to action with terminal quickstart
function ClosingSlide() {
  return (
    <section data-screen-label="06 Closing" className="bg-ink">
      <SlideCorner kicker="GET STARTED · 06 / 06" />
      <div className="slide-pad" style={{paddingTop: 200, justifyContent: "center"}}>
        <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 96, alignItems: "center"}}>
          <div>
            <Eyebrow>Get started in one repository</Eyebrow>
            <h2 className="h-title" style={{color: "var(--on-ink)", maxWidth: 850, fontSize: 96}}>
              Clone, personalize, ship.
            </h2>
            <p className="lead" style={{marginTop: 40, maxWidth: 750}}>
              Fork the repo, adapt the steering docs, and start a feature through natural language or slash commands.
            </p>
            <div style={{display: "flex", gap: 20, marginTop: 56, alignItems: "center"}}>
              <a style={{
                display: "inline-flex",
                alignItems: "center",
                background: "var(--highlighter)",
                color: "var(--ink)",
                padding: "22px 40px",
                borderRadius: 8,
                fontWeight: 760,
                fontSize: 24,
                textDecoration: "none",
                border: "1px solid var(--highlighter)",
              }}>Get started</a>
              <span className="mono" style={{fontSize: 20, color: "var(--on-ink-mute)"}}>github.com/Luis85/agentic-workflow</span>
            </div>
          </div>
          <figure style={{
            background: "var(--ink-soft)",
            borderRadius: 12,
            border: "1px solid rgba(248, 250, 245, 0.12)",
            overflow: "hidden",
            boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
          }}>
            <header style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "16px 20px",
              borderBottom: "1px solid rgba(248, 250, 245, 0.08)",
              background: "rgba(255,255,255,0.02)",
            }}>
              <span style={{width: 14, height: 14, borderRadius: 999, background: "#ff5f57"}}></span>
              <span style={{width: 14, height: 14, borderRadius: 999, background: "#febc2e"}}></span>
              <span style={{width: 14, height: 14, borderRadius: 999, background: "#28c840"}}></span>
              <span className="mono" style={{marginLeft: 16, fontSize: 16, color: "var(--on-ink-dim)"}}>my-project &mdash; claude</span>
            </header>
            <pre className="mono" style={{
              margin: 0,
              padding: "32px 36px",
              fontSize: 22,
              lineHeight: 1.65,
              color: "var(--on-ink)",
              whiteSpace: "pre",
            }}>
{`$ git clone https://github.com/Luis85/agentic-workflow.git my-project
$ cd my-project
$ npm install
$ npm run verify
$ claude`}
            </pre>
          </figure>
        </div>
      </div>
      <SlideFoot
        left={<BrandMini />}
        right={<span>specs first &middot; code second</span>}
      />
    </section>
  );
}
window.ClosingSlide = ClosingSlide;
