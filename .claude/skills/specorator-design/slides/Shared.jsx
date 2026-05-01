// Shared.jsx — small helpers used across slides
function BrandMini({ label = "specorator" }) {
  return (
    <span className="brand-mini">
      <span className="glyph">S</span>
      <span>{label}</span>
    </span>
  );
}

function SlideCorner({ kicker, brand = true }) {
  return (
    <div className="slide-corner">
      {brand ? <BrandMini /> : <span></span>}
      {kicker ? <span>{kicker}</span> : null}
    </div>
  );
}

function SlideFoot({ left, right }) {
  return (
    <div className="slide-foot">
      <span className="slide-meta">{left}</span>
      <span className="slide-meta">{right}</span>
    </div>
  );
}

function Eyebrow({ children }) {
  return (
    <p className="eyebrow">
      <span className="dot"></span>
      <span>{children}</span>
    </p>
  );
}

function StatusPill({ children }) {
  return (
    <span className="status-pill">
      <span className="pill-dot"></span>
      <span>{children}</span>
    </span>
  );
}

Object.assign(window, { BrandMini, SlideCorner, SlideFoot, Eyebrow, StatusPill });
