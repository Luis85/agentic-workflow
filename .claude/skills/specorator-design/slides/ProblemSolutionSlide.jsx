// ProblemSolutionSlide.jsx — two-up colored panels (matches WhyPanels component)
function ProblemSolutionSlide() {
  return (
    <section data-screen-label="02 Problem and solution" className="bg-paper">
      <SlideCorner kicker="WHY · 02 / 06" />
      <div className="slide-pad" style={{paddingTop: 160, justifyContent: "center"}}>
        <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48}}>
          <article style={{background: "var(--soft-yellow)", borderRadius: 8, padding: "72px 64px", border: "1px solid var(--line)"}}>
            <p className="eyebrow" style={{color: "#8a6309"}}>
              <span className="dot"></span>
              <span>The problem</span>
            </p>
            <h2 className="h-title" style={{fontSize: 76, marginTop: 16}}>
              AI coding tools often start in the wrong place.
            </h2>
            <p className="lead" style={{marginTop: 40, color: "var(--ink)", fontSize: 28}}>
              Most assistants jump straight to implementation. That can produce code quickly, but it also bakes in unclear requirements, missing decisions, and late-stage rework.
            </p>
          </article>
          <article style={{background: "var(--soft-green)", borderRadius: 8, padding: "72px 64px", border: "1px solid var(--line)"}}>
            <p className="eyebrow">
              <span className="dot"></span>
              <span>The product</span>
            </p>
            <h2 className="h-title" style={{fontSize: 76, marginTop: 16}}>
              Specs first, code second.
            </h2>
            <p className="lead" style={{marginTop: 40, color: "var(--ink)", fontSize: 28}}>
              Specorator turns software work into staged artifacts, specialist roles, quality gates, and traceable decisions so agents can move fast without guessing what humans meant.
            </p>
          </article>
        </div>
      </div>
      <SlideFoot left={<BrandMini />} right={<span>02 / 06</span>} />
    </section>
  );
}
window.ProblemSolutionSlide = ProblemSolutionSlide;
