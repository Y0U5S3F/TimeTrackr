import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * Debounced name-search input with a keyboard-navigable suggestions
 * dropdown. `fetchResults(query)` must return a Promise<Array<{id,name,skill}>>.
 */
export default function SearchBox({ placeholder, fetchResults, onSelect, autoFocus = false }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const debounceRef = useRef(null);
  const wrapRef = useRef(null);

  useEffect(() => {
    function onDocClick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  function handleChange(e) {
    const q = e.target.value;
    setQuery(q);
    clearTimeout(debounceRef.current);
    const trimmed = q.trim();
    if (!trimmed) {
      setOpen(false);
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      const r = await fetchResults(trimmed);
      setResults(r);
      setActiveIndex(-1);
      setOpen(true);
    }, 150);
  }

  function select(emp) {
    setOpen(false);
    setResults([]);
    setQuery("");
    onSelect(emp.id);
  }

  function handleKeyDown(e) {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      if (activeIndex >= 0 && results[activeIndex]) select(results[activeIndex]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div className="relative" ref={wrapRef}>
      <div className="flex items-center gap-3 rounded-[var(--radius)] border border-border bg-card px-4 transition-colors focus-within:border-[var(--accent)]">
        <svg
          className="h-[18px] w-[18px] shrink-0 text-[var(--text-faint)]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <Input
          type="text"
          value={query}
          placeholder={placeholder}
          autoComplete="off"
          spellCheck="false"
          autoFocus={autoFocus}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className="h-auto flex-1 border-0 bg-transparent px-0 py-4 text-base focus-visible:border-0"
        />
      </div>

      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-10 overflow-hidden rounded-[var(--radius)] border border-border bg-card">
          {results.length === 0 ? (
            <div className="p-4 text-center text-[13px] text-[var(--text-faint)]">No one matches that name yet</div>
          ) : (
            results.map((emp, i) => (
              <div
                key={emp.id}
                className={cn(
                  "flex cursor-pointer items-center justify-between border-b border-border px-4 py-3 text-sm last:border-b-0",
                  i === activeIndex ? "bg-[var(--panel-hover)]" : "hover:bg-[var(--panel-hover)]"
                )}
                onClick={() => select(emp)}
              >
                <span className="text-foreground">{emp.name}</span>
                <span className="text-[11px] uppercase tracking-[0.05em] text-[var(--text-faint)]">{emp.skill || ""}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
