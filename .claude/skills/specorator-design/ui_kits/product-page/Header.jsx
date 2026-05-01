// Header.jsx — sticky brand bar
function Header() {
  return (
    <React.Fragment>
      <a className="skip-link" href="#main">Skip to content</a>
      <header className="site-header">
        <a className="brand" href="#main" aria-label="Specorator home">
          <span className="brand-mark" aria-hidden="true">S</span>
          <span>Specorator</span>
        </a>
        <nav className="nav-links" aria-label="Primary navigation">
          <a href="#team">Team</a>
          <a href="#fit">Fit</a>
          <a href="#workflow">Workflow</a>
          <a href="#tracks">Tracks</a>
          <a href="#roster">Roster</a>
          <a href="#start">Start</a>
          <a href="https://github.com/Luis85/agentic-workflow/blob/main/docs/specorator.md">Docs</a>
          <a href="https://github.com/Luis85/agentic-workflow">GitHub</a>
        </nav>
      </header>
    </React.Fragment>
  );
}
window.Header = Header;
