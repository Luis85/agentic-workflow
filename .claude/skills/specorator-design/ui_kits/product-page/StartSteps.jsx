// StartSteps.jsx — dark section with steps + terminal quickstart
const STEPS = [
  ["1", "Clone or fork", "Copy the repository into a new workspace, or fork it on GitHub when you want to track changes upstream."],
  ["2", "Personalize context", "Adapt the constitution and steering docs so agents know your product, stack, and quality bar."],
  ["3", "Open Claude Code", "Start from a feature idea, a design sprint, or the orchestrated end-to-end workflow."],
  ["4", "Verify and PR", "Keep every concern on its own branch, run npm run verify, and ship through review."],
];

function StartSteps() {
  return (
    <section className="section dark" id="start" aria-labelledby="start-title">
      <div className="section-header">
        <h2 id="start-title">Get started in one repository.</h2>
        <p className="section-kicker">Clone or fork the repository, fill in the steering context, and start a feature through natural language or slash commands.</p>
      </div>
      <div className="steps">
        {STEPS.map(([n, title, body]) => (
          <article key={n} className="step">
            <span className="step-number">{n}</span>
            <h3>{title}</h3>
            <p>{body.includes("npm run verify") ? <React.Fragment>Keep every concern on its own branch, run <code>npm run verify</code>, and ship through review.</React.Fragment> : body}</p>
          </article>
        ))}
      </div>
      <div className="quickstart" aria-label="Quickstart commands">
        <div className="quickstart-intro">
          <h3>Quickstart</h3>
          <p>Install dependencies, run the verify gate, then open Claude Code and start from discovery or a feature brief.</p>
        </div>
        <figure className="terminal">
          <header className="terminal-chrome" aria-hidden="true">
            <span className="terminal-dot terminal-dot-red"></span>
            <span className="terminal-dot terminal-dot-yellow"></span>
            <span className="terminal-dot terminal-dot-green"></span>
            <span className="terminal-title">my-project &mdash; claude</span>
          </header>
          <pre><code>{`git clone https://github.com/Luis85/agentic-workflow.git my-project
cd my-project
npm install
npm run verify
claude`}</code></pre>
        </figure>
      </div>
    </section>
  );
}
window.StartSteps = StartSteps;
