// ArtifactExample.jsx — 3-card chain of artifacts
function ArtifactExample() {
  return (
    <section className="section example-section" id="example" aria-labelledby="example-title">
      <div className="section-header">
        <h2 id="example-title">From a one-line brief to working code.</h2>
        <p className="section-kicker">A walk-through of the worked CLI todo example &mdash; the smallest realistic feature you can read end to end. Each stage produces a Markdown artifact with stable IDs that flow forward to the next.</p>
      </div>
      <div className="artifact-chain" aria-label="Three example artifacts produced in sequence">
        <figure className="artifact-card">
          <header className="artifact-card-head">
            <span className="artifact-step">Stage 1 &middot; Idea</span>
            <code className="artifact-path">examples/cli-todo/idea.md</code>
          </header>
          <pre className="artifact-source"
               dangerouslySetInnerHTML={{__html:
`<span class="md-h1"># Idea: CLI todo app</span>

<span class="md-h2">## Brief</span>
Solo engineers want to capture, list,
and complete short-lived tasks without
leaving the shell.

<span class="md-h2">## User</span>
Terminal-native engineers; contributors
reading this kit's worked example.

<span class="md-h2">## Outcome</span>
A \`todo\` binary with add, list, done,
rm. First add &rarr; list &rarr; done in
under two minutes.`}} />
        </figure>
        <figure className="artifact-card">
          <header className="artifact-card-head">
            <span className="artifact-step">Stage 3 &middot; Requirements</span>
            <code className="artifact-path">examples/cli-todo/requirements.md</code>
          </header>
          <pre className="artifact-source"
               dangerouslySetInnerHTML={{__html:
`<span class="md-h1"># Requirements: CLI todo app</span>

<span class="md-id">REQ-CLI-001</span>
<span class="md-em">When</span> the user invokes \`todo add\`
with a non-empty text argument,
<span class="md-em">the CLI shall</span> create a new task
with a unique sequential ID and persist
it for later \`todo list\` calls.

<span class="md-id">REQ-CLI-002</span>
<span class="md-em">When</span> the user invokes \`todo list\`,
<span class="md-em">the CLI shall</span> display every open
task on its own line.`}} />
        </figure>
        <figure className="artifact-card">
          <header className="artifact-card-head">
            <span className="artifact-step">Stage 6 &middot; Tasks</span>
            <code className="artifact-path">examples/cli-todo/tasks.md</code>
          </header>
          <pre className="artifact-source"
               dangerouslySetInnerHTML={{__html:
`<span class="md-h1"># Tasks: CLI todo app</span>

<span class="md-id">T-CLI-007</span>  Command behavior tests
  owner: qa    &rarr; <span class="md-id">REQ-CLI-001</span>, <span class="md-id">REQ-CLI-002</span>

<span class="md-id">T-CLI-008</span>  Implement task commands
  owner: dev   &rarr; <span class="md-id">REQ-CLI-001</span>, <span class="md-id">REQ-CLI-002</span>

<span class="md-id">T-CLI-009</span>  Review and traceability
  owner: dev   &rarr; <span class="md-id">REQ-CLI-001</span>, <span class="md-id">REQ-CLI-002</span>`}} />
        </figure>
      </div>
      <div className="artifact-meta">
        <p>Every requirement carries a stable ID that flows forward &mdash; <code>REQ</code> to <code>T</code> to <code>TEST</code>. The traceability matrix is regenerable from the artifacts; nothing ships without a chain.</p>
        <ul className="artifact-list">
          <li><a href="https://github.com/Luis85/agentic-workflow/tree/main/examples/cli-todo">Browse every cli-todo artifact &rarr;</a></li>
          <li><a href="https://github.com/Luis85/agentic-workflow/blob/main/docs/workflow-overview.md">Workflow cheat sheet &rarr;</a></li>
          <li><a href="https://github.com/Luis85/agentic-workflow/blob/main/docs/quality-framework.md">Quality gates &rarr;</a></li>
        </ul>
      </div>
    </section>
  );
}
window.ArtifactExample = ArtifactExample;
