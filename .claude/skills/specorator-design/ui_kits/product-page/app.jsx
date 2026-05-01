// app.jsx — composition root
function App() {
  return (
    <React.Fragment>
      <Header />
      <main id="main">
        <Hero />
        <WhyPanels />
        <TeamGrid />
        <FitGrid />
        <FeatureGrid />
        <AudienceGrid />
        <Workflow />
        <TrackGrid />
        <Roster />
        <RepoGrid />
        <ArtifactExample />
        <Faq />
        <StartSteps />
      </main>
      <Footer />
    </React.Fragment>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
