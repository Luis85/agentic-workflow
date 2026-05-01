// CoverSlide.jsx — opening title slide
function CoverSlide() {
  return (
    <section data-screen-label="01 Cover" className="bg-paper">
      <SlideCorner kicker="OPEN-SOURCE TEMPLATE · MIT" />
      <div className="slide-pad" style={{justifyContent: "center", paddingTop: 240}}>
        <Eyebrow>The agentic-workflow repo</Eyebrow>
        <h1 className="h-display" style={{maxWidth: 1500}}>
          Stop letting AI write the wrong code.
        </h1>
        <p className="lead" style={{marginTop: 56, maxWidth: 1100}}>
          Specs first, code second. You decide <em style={{fontStyle: "italic", color: "var(--ink)"}}>what</em> to build; specialist agents handle <em style={{fontStyle: "italic", color: "var(--ink)"}}>how</em>; every decision stays traceable.
        </p>
      </div>
      <SlideFoot
        left={<span>luis85.github.io/agentic-workflow</span>}
        right={<span>v0.2 — May 2026</span>}
      />
    </section>
  );
}
window.CoverSlide = CoverSlide;
