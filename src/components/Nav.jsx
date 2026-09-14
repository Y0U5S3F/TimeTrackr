import { useState } from "react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

const LINKS = [
  { to: "/", label: "Final" },
  { to: "/draft", label: "Draft" },
  { to: "/swap", label: "Swap" },
  { to: "/profile", label: "Profile" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="relative z-10 border-b border-border py-4.5">
      <div className="wrap flex items-baseline justify-between relative">
        <NavLink
          to="/"
          className="font-display font-bold text-xl tracking-[0.14em] text-foreground no-underline inline-flex items-center gap-2"
        >
          <span
            className="inline-block h-[7px] w-[7px] rounded-full bg-primary shadow-[0_0_8px_var(--accent)]"
            style={{ animation: "dot-pulse 2.2s ease-in-out infinite" }}
          />
          ESC_RA Timeline
        </NavLink>

        <nav
          className={cn(
            "flex gap-1 ml-auto mr-3 max-sm:absolute max-sm:top-[calc(100%+1px)] max-sm:left-0 max-sm:right-0",
            "max-sm:m-0 max-sm:flex-col max-sm:gap-0 max-sm:bg-card max-sm:border-b max-sm:border-border",
            "max-sm:overflow-hidden max-sm:transition-[max-height,opacity] max-sm:duration-300",
            open ? "max-sm:max-h-[260px] max-sm:opacity-100" : "max-sm:max-h-0 max-sm:opacity-0"
          )}
        >
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                cn(
                  "relative inline-block px-3.5 py-2 rounded-[var(--radius)] font-mono text-[13px] tracking-[0.02em] no-underline",
                  "transition-colors duration-200 hover:text-foreground hover:bg-[var(--panel-hover)]",
                  "after:content-[''] after:absolute after:left-3.5 after:right-3.5 after:bottom-1 after:h-px after:bg-primary",
                  "after:origin-left after:transition-transform after:duration-200",
                  isActive ? "text-primary after:scale-x-100" : "text-muted-foreground after:scale-x-0 hover:after:scale-x-100",
                  "max-sm:px-5 max-sm:py-3.5 max-sm:border-b max-sm:border-border max-sm:rounded-none max-sm:after:hidden"
                )
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <button
          className="hidden max-sm:flex flex-col justify-center gap-[5px] h-8 w-8 bg-transparent border-0 cursor-pointer p-0"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <span
            className={cn(
              "block h-0.5 w-full rounded-sm bg-foreground transition-transform duration-300",
              open && "translate-y-[7px] rotate-45"
            )}
          />
          <span className={cn("block h-0.5 w-full rounded-sm bg-foreground transition-opacity duration-300", open && "opacity-0")} />
          <span
            className={cn(
              "block h-0.5 w-full rounded-sm bg-foreground transition-transform duration-300",
              open && "-translate-y-[7px] -rotate-45"
            )}
          />
        </button>
      </div>
    </header>
  );
}
