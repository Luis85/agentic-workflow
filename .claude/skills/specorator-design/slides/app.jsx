// app.jsx — deck composition
// 6-slide default. QuoteSlide / SectionDividerSlide / StatsSlide are kept as
// reusable components for longer decks but excluded from the canonical deck.
function Deck() {
  return (
    <React.Fragment>
      <CoverSlide />
      <ProblemSolutionSlide />
      <WorkflowSlide />
      <TeamGridSlide />
      <ArtifactSlide />
      <ClosingSlide />
    </React.Fragment>
  );
}

const stage = document.querySelector("deck-stage");
const root = ReactDOM.createRoot(stage);
root.render(<Deck />);
