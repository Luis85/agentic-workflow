// ArtifactSlide.jsx — three markdown specimens, the trace chain
function ArtifactCard({ step, path, code }) {
  return (
    <figure style={{
      background: "var(--surface)",
      border: "1px solid var(--line)",
      borderRadius: 12,
      padding: 0,
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
    }}>
      <header style={{
        padding: "20px 24px",
        borderBottom: "1px solid var(--line)",
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}>
        <span className="mono" style={{fontSize: 13, color: "var(--accent-strong)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 800}}>{step}</span>
        <code className="mono" style={{fontSize: 16, color: "var(--ink)"}}>{path}</code>
      </header>
      <pre className="mono" style={{
        margin: 0,
        padding: "24px 28px",
        fontSize: 15,
        lineHeight: 1.55,
        color: "var(--ink)",
        flex: 1,
        background: "var(--paper)",
        whiteSpace: "pre-wrap",
      }} dangerouslySetInnerHTML={{__html: code}} />
    </figure>
  );
}

const A_IDEA =
`<span style="color:var(--accent-strong);font-weight:700"># Idea: CLI todo app</span>

<span style="color:var(--accent-strong);font-weight:700">## Brief</span>
Solo engineers want to capture, list,
and complete short-lived tasks without
leaving the shell.

<span style="color:var(--accent-strong);font-weight:700">## Outcome</span>
A \`todo\` binary with add, list, done,
rm. First add → list → done in
under two minutes.`;

const A_REQ =
`<span style="color:var(--accent-strong);font-weight:700"># Requirements: CLI todo app</span>

<span style="background:var(--soft-blue);color:#22397a;font-weight:700;padding:1px 6px;border-radius:4px">REQ-CLI-001</span>
<span style="font-style:italic">When</span> the user invokes \`todo add\`
with a non-empty text argument,
<span style="font-style:italic">the CLI shall</span> create a new task
with a unique sequential ID and persist
it for later \`todo list\` calls.

<span style="background:var(--soft-blue);color:#22397a;font-weight:700;padding:1px 6px;border-radius:4px">REQ-CLI-002</span>
<span style="font-style:italic">When</span> the user invokes \`todo list\`,
<span style="font-style:italic">the CLI shall</span> display every open
task on its own line.`;

const A_TASKS =
`<span style="color:var(--accent-strong);font-weight:700"># Tasks: CLI todo app</span>

<span style="background:var(--soft-yellow);color:#8a6309;font-weight:700;padding:1px 6px;border-radius:4px">T-CLI-007</span>  Command behavior tests
  owner: qa    → <span style="background:var(--soft-blue);color:#22397a;font-weight:700;padding:1px 6px;border-radius:4px">REQ-CLI-001</span>, <span style="background:var(--soft-blue);color:#22397a;font-weight:700;padding:1px 6px;border-radius:4px">REQ-CLI-002</span>

<span style="background:var(--soft-yellow);color:#8a6309;font-weight:700;padding:1px 6px;border-radius:4px">T-CLI-008</span>  Implement task commands
  owner: dev   → <span style="background:var(--soft-blue);color:#22397a;font-weight:700;padding:1px 6px;border-radius:4px">REQ-CLI-001</span>, <span style="background:var(--soft-blue);color:#22397a;font-weight:700;padding:1px 6px;border-radius:4px">REQ-CLI-002</span>

<span style="background:var(--soft-yellow);color:#8a6309;font-weight:700;padding:1px 6px;border-radius:4px">T-CLI-009</span>  Review and traceability
  owner: dev   → <span style="background:var(--soft-blue);color:#22397a;font-weight:700;padding:1px 6px;border-radius:4px">REQ-CLI-001</span>, <span style="background:var(--soft-blue);color:#22397a;font-weight:700;padding:1px 6px;border-radius:4px">REQ-CLI-002</span>`;

function ArtifactSlide() {
  return (
    <section data-screen-label="05 Artifact chain" className="bg-paper">
      <SlideCorner kicker="EXAMPLE · 05 / 06" />
      <div className="slide-pad" style={{paddingTop: 160}}>
        <Eyebrow>Example · cli-todo</Eyebrow>
        <h2 className="h-title" style={{maxWidth: 1600, marginBottom: 48, fontSize: 76}}>
          From a one-line brief to working code.
        </h2>
        <div style={{display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 28, flex: 1, minHeight: 0}}>
          <ArtifactCard step="Stage 1 · Idea" path="examples/cli-todo/idea.md" code={A_IDEA} />
          <ArtifactCard step="Stage 3 · Requirements" path="examples/cli-todo/requirements.md" code={A_REQ} />
          <ArtifactCard step="Stage 6 · Tasks" path="examples/cli-todo/tasks.md" code={A_TASKS} />
        </div>
        <p style={{marginTop: 32, fontSize: 22, color: "var(--muted)", maxWidth: 1500}}>
          Every requirement carries a stable ID that flows forward &mdash; <code className="mono" style={{color: "var(--accent-strong)"}}>REQ</code> to <code className="mono" style={{color: "var(--accent-strong)"}}>T</code> to <code className="mono" style={{color: "var(--accent-strong)"}}>TEST</code>. Nothing ships without a chain.
        </p>
      </div>
      <SlideFoot left={<BrandMini />} right={<span>05 / 06</span>} />
    </section>
  );
}
window.ArtifactSlide = ArtifactSlide;
