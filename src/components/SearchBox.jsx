import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";

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
    <div className="searchbox" ref={wrapRef}>
      <svg className="searchbox-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
      />
      {open && (
        <div className="suggestions">
          {results.length === 0 ? (
            <div className="suggestion-empty">No one matches that name yet</div>
          ) : (
            results.map((emp, i) => (
              <div
                key={emp.id}
                className={`suggestion${i === activeIndex ? " active" : ""}`}
                onClick={() => select(emp)}
              >
                <span className="suggestion-name">{emp.name}</span>
                <span className="suggestion-skill">{emp.skill || ""}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
