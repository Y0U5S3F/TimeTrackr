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
        <Button variant="link" className="back-btn" onClick={backToSearch}>
          ← Back to search
        </Button>

        <div className="board-header">
          <h2>{board.employee.name}</h2>
          <Badge className="board-skill">{board.employee.skill || ""}</Badge>
        </div>

        {board.days.length === 0 ? (
          <p className="board-empty">No schedule on file for this person yet.</p>
        ) : (
          <BoardRows days={board.days} />
        )}
      </section>
    );
  }

  return (
    <section className="screen" id="screen-home">
      <h1 className="hero-title">Find your shifts.</h1>
      <span className="topbar-sub">{clock}</span>
      <p className="hero-sub">Type your name to see when you're on.</p>

      <SearchBox
        placeholder="Start typing a name…"
        fetchResults={fetchSearch}
        onSelect={selectEmployee}
      />
      <p className="search-hint">Schedules update whenever a new file is uploaded.</p>

      {stats && (
        <div className="stats-strip">
          <div className="stat">
            <span className="stat-num">{stats.employeeCount}</span>
            <span className="stat-label">people tracked</span>
          </div>
          <div className="stat-sep">·</div>
          <div className="stat">
            <span className="stat-num">
              {stats.firstDate ? `${formatDate(stats.firstDate)} – ${formatDate(stats.lastDate)}` : "—"}
            </span>
            <span className="stat-label">covered</span>
          </div>
          <div className="stat-sep">·</div>
          <div className="stat">
            <span className="stat-num">{timeAgo(stats.lastUpload)}</span>
            <span className="stat-label">last update</span>
          </div>
        </div>
      )}

      <div className="legend">
        <span className="legend-item"><i className="dot dot-shift"></i>Working shift</span>
        <span className="legend-item"><i className="dot dot-off"></i>Day off (R)</span>
        <span className="legend-item"><i className="dot dot-leave"></i>Paid leave (CP)</span>
        <span className="legend-item"><i className="dot dot-today"></i>Today</span>
        <span className="legend-item"><i className="dot dot-tomorrow"></i>Tomorrow</span>
      </div>
    </section>
  );
}
