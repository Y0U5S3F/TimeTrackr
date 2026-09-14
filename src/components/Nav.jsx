import { useState } from "react";
import { NavLink } from "react-router-dom";

const LINKS = [
  { to: "/", label: "Final" },
  { to: "/draft", label: "Draft" },
  { to: "/swap", label: "Swap" },
  { to: "/profile", label: "Profile" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="topbar">
      <div className="wrap topbar-inner">
        <NavLink to="/" className="wordmark">
          ESC_RA Timeline
        </NavLink>

        <nav className={`navlinks${open ? " open" : ""}`}>
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              className={({ isActive }) => `navlink${isActive ? " active" : ""}`}
              onClick={() => setOpen(false)}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <button
          className={`nav-toggle${open ? " open" : ""}`}
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <span></span><span></span><span></span>
        </button>
      </div>
    </header>
  );
}
