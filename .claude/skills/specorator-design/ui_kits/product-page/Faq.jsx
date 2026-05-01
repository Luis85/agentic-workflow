// Faq.jsx — 6 Q&A cards
const FAQS = [
  ["How is this different from spec-kit, Aider, or Copilot Workspace?",
   <React.Fragment>They&rsquo;re tools; Specorator is a <strong>process</strong> you can run on top of them. The 11-stage lifecycle, named specialist agents, quality gates, and trace IDs are the real differentiators. Claude Code gets first-class slash commands, but the workflow itself is described in <code>AGENTS.md</code> and works with Codex, Cursor, Aider, Copilot, and Gemini.</React.Fragment>],
  ["Do I have to use Claude Code?",
   <React.Fragment>No. Claude Code gets first-class commands and the skills layer is Claude-specific, but the workflow itself is described in <code>AGENTS.md</code> and runs with any agent that can read Markdown. The artifacts, IDs, and quality gates are tool-agnostic.</React.Fragment>],
  ["Is this a library or a template?",
   <React.Fragment>A template. Fork the repo, replace <code>docs/steering/</code> with your own product context, adapt <code>memory/constitution.md</code> to your team&rsquo;s principles, and start a feature. The default content is intentionally generic &mdash; every project will overwrite parts of it.</React.Fragment>],
  ["Can I use it without GitHub?",
   <React.Fragment>Yes for the lifecycle. Verify gate, agents, skills, and artifacts all run locally. Some optional bits lean on GitHub (Pages deploy, Actions for typos / spell-check / verify CI), but the core workflow doesn&rsquo;t depend on it. Local hooks deny direct <code>main</code> pushes the same way branch protection would.</React.Fragment>],
  ["Is the 11-stage lifecycle overkill for a one-person project?",
   <React.Fragment>For a throwaway script, yes. For anything you&rsquo;ll maintain past the first commit, no &mdash; stages move in minutes when there&rsquo;s no stakeholder cycle to run. Solo builders use the <code>orchestrate</code> skill and gate themselves between stages. The mandatory retrospective at the end is what compounds the value over time.</React.Fragment>],
  ["Do I have to learn the slash commands?",
   <React.Fragment>No. The conductor skills (<code>orchestrate</code>, <code>discovery-sprint</code>, <code>project-run</code>, etc.) auto-trigger on natural language. Slash commands are the manual escape hatch when you want precise control. Every entry point in the audience cards above shows the natural-language form.</React.Fragment>],
];

function Faq() {
  return (
    <section className="section faq-section" id="faq" aria-labelledby="faq-title">
      <div className="section-header">
        <h2 id="faq-title">Questions you probably have.</h2>
        <p className="section-kicker">Six honest answers for evaluators &mdash; positioning, prerequisites, scope, and friction.</p>
      </div>
      <div className="faq-grid">
        {FAQS.map(([q, a]) => (
          <article key={q} className="faq-item">
            <h3>{q}</h3>
            <p>{a}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
window.Faq = Faq;
