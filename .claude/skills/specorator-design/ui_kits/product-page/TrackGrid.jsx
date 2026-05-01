// TrackGrid.jsx — 8 opt-in tracks
const TRACKS = [
  { when: "Pre-brief",     title: "Discovery",            phases: ["Frame","Diverge","Converge","Prototype","Validate"], cmd: "/discovery:start", purpose: "From blank page to validated brief, before any code." },
  { when: "Legacy systems",title: "Stock-taking",         phases: ["Scope","Audit","Synthesize","Handoff"],               cmd: "/stock:start",     purpose: "Inventory what's already there before changing it." },
  { when: "Pre-contract",  title: "Sales Cycle",          phases: ["Qualify","Scope","Estimate","Propose","Order"],       cmd: "/sales:start",     purpose: "Win the engagement, then hand off the kickoff brief." },
  { when: "Post-contract", title: "Project Manager",      phases: ["Initiate","Weekly","Change","Report","Close"],        cmd: "/project:start",   purpose: "Govern client delivery with P3.Express cadence." },
  { when: "Multi-project", title: "Portfolio",            phases: ["X \u00b7 6-monthly","Y \u00b7 monthly","Z \u00b7 daily"], cmd: "/portfolio:start", purpose: "Manage a portfolio of programs with P5 Express cycles." },
  { when: "Always-on",     title: "Roadmap Management",   phases: ["Shape","Align","Review","Communicate"],               cmd: "/roadmap:start",   purpose: "Outcome roadmaps that stay current with delivery signals." },
  { when: "Readiness",     title: "Quality Assurance",    phases: ["Plan","Check","Review","Improve"],                    cmd: "/quality:start",   purpose: "ISO 9001-aligned readiness reviews and corrective actions." },
  { when: "Onboarding",    title: "Project Scaffolding",  phases: ["Intake","Extract","Assemble","Handoff"],              cmd: "/scaffold:start",  purpose: "Turn folders and Markdown notes into a reviewable starter pack." },
];

function TrackGrid() {
  return (
    <section className="section tracks-section" id="tracks" aria-labelledby="tracks-title">
      <div className="section-header">
        <h2 id="tracks-title">Eight more tracks. All opt-in.</h2>
        <p className="section-kicker">Specorator stays small at the core and grows on demand. Each track is a separate set of slash commands and agents &mdash; invoke the ones that match your context.</p>
      </div>
      <div className="track-grid" aria-label="Opt-in workflow tracks">
        {TRACKS.map(t => (
          <article key={t.title} className="track-card">
            <header className="track-card-head">
              <span className="track-when">{t.when}</span>
              <h3>{t.title}</h3>
            </header>
            <ol className="track-phases">
              {t.phases.map(p => <li key={p}>{p}</li>)}
            </ol>
            <p className="track-purpose">{t.purpose}</p>
            <code className="track-cmd">{t.cmd}</code>
          </article>
        ))}
      </div>
      <p className="track-footnote">All eight tracks are optional and pluggable. <a href="#roster">See the agents that drive them &rarr;</a></p>
    </section>
  );
}
window.TrackGrid = TrackGrid;
