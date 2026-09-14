import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import SearchBox from "@/components/SearchBox";
import BoardRows from "@/components/BoardRows";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, timeAgo } from "@/lib/date";

function useClock() {
  const [text, setText] = useState("");
  useEffect(() => {
    function tick() {
      setText(
        new Date().toLocaleString("en-GB", {
          weekday: "short",
          day: "2-digit",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    }
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, []);
  return text;
}

async function fetchSearch(q) {
  try {
    const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
    return await res.json();
  } catch {
    return [];
  }
}

export default function Home() {
  const clock = useClock();
  const [stats, setStats] = useState(null);
  const [board, setBoard] = useState(null); // { employee, days } | null
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/stats");
        const s = await res.json();
        if (s.employeeCount === 0) return;
        setStats(s);
      } catch {
        /* stats are a nice-to-have, fail quietly */
      }
    })();
  }, []);

  async function selectEmployee(id) {
    try {
      const res = await fetch(`/api/employee/${encodeURIComponent(id)}`);
      if (!res.ok) throw new Error("not found");
      const data = await res.json();
      setBoard(data);
      setSearchParams({ employee: id });
      window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
    } catch {
      /* silently ignore — could show a toast, kept minimal on purpose */
    }
  }

  useEffect(() => {
    const id = searchParams.get("employee");
    if (id) selectEmployee(id);
    else setBoard(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  function backToSearch() {
    setBoard(null);
    navigate("/");
    window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
  }

  if (board) {
    return (
      <section className="screen" id="screen-board">
        <Button variant="link" className="mb-6 font-mono text-[13px] text-[var(--text-faint)] hover:text-muted-foreground" onClick={backToSearch}>
          ← Back to search
        </Button>

        <div className="mb-6 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="m-0 font-display text-[30px] font-black uppercase tracking-tight text-foreground">{board.employee.name}</h2>
          <Badge variant="outline">{board.employee.skill || ""}</Badge>
        </div>

        {board.days.length === 0 ? (
          <p className="py-6 text-sm text-[var(--text-faint)]">No schedule on file for this person yet.</p>
        ) : (
          <BoardRows days={board.days} />
        )}
      </section>
    );
  }

  return (
    <section className="screen" id="screen-home">
      <h1 className="m-0 mb-2.5 font-display text-[44px] max-[480px]:text-[34px] font-black uppercase leading-[1.02] tracking-tight text-foreground">
        Find your shifts.
      </h1>
      <span className="text-xs tracking-[0.05em] text-[var(--text-faint)]">{clock}</span>
      <p className="mt-2.5 mb-8 font-mono text-sm text-muted-foreground">Type your name to see when you&rsquo;re on.</p>

      <SearchBox placeholder="Start typing a name…" fetchResults={fetchSearch} onSelect={selectEmployee} />
      <p className="mt-2.5 ml-0.5 text-xs text-[var(--text-faint)]">Schedules update whenever a new file is uploaded.</p>

      {stats && (
        <div className="mt-10 flex flex-wrap items-baseline gap-3 text-[13px]">
          <div className="inline-flex items-baseline gap-1.5">
            <span className="font-medium text-primary">{stats.employeeCount}</span>
            <span className="text-[var(--text-faint)]">people tracked</span>
          </div>
          <div className="text-[var(--text-faint)]">·</div>
          <div className="inline-flex items-baseline gap-1.5">
            <span className="font-medium text-primary">
              {stats.firstDate ? `${formatDate(stats.firstDate)} – ${formatDate(stats.lastDate)}` : "—"}
            </span>
            <span className="text-[var(--text-faint)]">covered</span>
          </div>
          <div className="text-[var(--text-faint)]">·</div>
          <div className="inline-flex items-baseline gap-1.5">
            <span className="font-medium text-primary">{timeAgo(stats.lastUpload)}</span>
            <span className="text-[var(--text-faint)]">last update</span>
          </div>
        </div>
      )}

      <div className="mt-5 flex flex-wrap gap-5 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-2">
          <i className="inline-block h-[9px] w-[9px] bg-primary" />
          Working shift
        </span>
        <span className="inline-flex items-center gap-2">
          <i className="inline-block h-[9px] w-[9px] bg-[var(--slate)]" />
          Day off (R)
        </span>
        <span className="inline-flex items-center gap-2">
          <i className="inline-block h-[9px] w-[9px] bg-[var(--leave)]" />
          Paid leave (CP)
        </span>
        <span className="inline-flex items-center gap-2">
          <i className="inline-block h-[9px] w-[9px] bg-[var(--today)]" />
          Today
        </span>
        <span className="inline-flex items-center gap-2">
          <i className="inline-block h-[9px] w-[9px] bg-[var(--tomorrow)]" />
          Tomorrow
        </span>
      </div>
    </section>
  );
}
