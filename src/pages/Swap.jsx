import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import SearchBox from "@/components/SearchBox";
import BoardRows from "@/components/BoardRows";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/date";

const STORAGE_KEY = "esc_ra_employee_id";

export default function Swap() {
  const [status, setStatus] = useState("loading"); // loading | empty | pick | partners | compare
  const [errorMsg, setErrorMsg] = useState("");
  const [data, setData] = useState({ draftDates: [], employees: [], pairs: [] });
  const [agentId, setAgentId] = useState(null);
  const [compareIds, setCompareIds] = useState(null); // [idA, idB]

  const byId = useMemo(() => {
    const map = {};
    for (const e of data.employees) map[e.id] = e;
    return map;
  }, [data.employees]);

  const partnersOf = useMemo(() => {
    const map = {};
    for (const [a, b] of data.pairs) {
      (map[a] ||= new Set()).add(b);
      (map[b] ||= new Set()).add(a);
    }
    return map;
  }, [data.pairs]);

  useEffect(() => {
    (async () => {
      const currentEmpId = localStorage.getItem(STORAGE_KEY);
      if (!currentEmpId) {
        setStatus("empty");
        return;
      }
      try {
        const res = await fetch(`/api/swap-candidates?empId=${encodeURIComponent(currentEmpId)}`);
        if (!res.ok) throw new Error(`API returned ${res.status}`);
        const d = await res.json();
        setData(d);
        if (!d.draftDates || d.draftDates.length === 0) {
          setStatus("empty");
          return;
        }
        setStatus("pick");
        if (d.employees.some((e) => e.id === currentEmpId)) {
          setAgentId(currentEmpId);
          setStatus("partners");
        }
      } catch (e) {
        setErrorMsg(e.message);
        setStatus("error");
      }
    })();
  }, []);

  function selectAgent(id) {
    setAgentId(id);
    setStatus("partners");
    window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
  }

  function selectCompare(idA, idB) {
    setCompareIds([idA, idB]);
    setStatus("compare");
    window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
  }

  async function fetchAgentResults(q) {
    const query = q.toLowerCase();
    return data.employees
      .filter((e) => e.name.toLowerCase().includes(query))
      .sort((a, b) => a.name.localeCompare(b.name))
      .slice(0, 20);
  }

  if (status === "loading") return null;

  if (status === "empty" && !localStorage.getItem(STORAGE_KEY)) {
    return (
      <section className="screen" id="screen-empty">
        <h1 className="hero-title">Not logged in.</h1>
        <p className="hero-sub">
          Please go to <Link to="/profile">Profile</Link> and select your name first.
        </p>
      </section>
    );
  }

  if (status === "error") {
    return (
      <section className="screen" id="screen-empty">
        <h1 className="hero-title">Error loading swap data.</h1>
        <p className="hero-sub">{errorMsg}</p>
      </section>
    );
  }

  if (status === "empty") {
    return (
      <section className="screen" id="screen-empty">
        <h1 className="hero-title">No draft on file.</h1>
        <p className="hero-sub">Upload a draft week first — swaps are computed against it.</p>
      </section>
    );
  }

  if (status === "compare" && compareIds) {
    const a = byId[compareIds[0]];
    const b = byId[compareIds[1]];
    return (
      <section className="screen" id="screen-compare">
        <Button variant="link" className="back-btn" onClick={() => setStatus("partners")}>
          ← Back to partner list
        </Button>

        <div className="compare-grid">
          <div className="compare-col">
            <h3>{a.name}</h3>
            <Badge className="board-skill">{a.skill || ""}</Badge>
            <BoardRows days={a.week} highlightTodayTomorrow={false} staggerMs={30} />
          </div>
          <div className="compare-col">
            <h3>{b.name}</h3>
            <Badge className="board-skill">{b.skill || ""}</Badge>
            <BoardRows days={b.week} highlightTodayTomorrow={false} staggerMs={30} />
          </div>
        </div>

        <p className="swap-verdict">✓ This swap keeps both agents under 7 consecutive working days and 12h+ rest between shifts.</p>
      </section>
    );
  }

  if (status === "partners" && agentId) {
    const emp = byId[agentId];
    if (!emp) return null;
    const partnerIds = emp.excluded
      ? []
      : [...(partnersOf[agentId] || [])].sort((x, y) => byId[x].name.localeCompare(byId[y].name));

    return (
      <section className="screen" id="screen-partners">
        <Button variant="link" className="back-btn" onClick={() => setStatus("pick")}>
          ← Choose a different agent
        </Button>

        <div className="board-header">
          <h2>{emp.name}</h2>
          <Badge className="board-skill">{emp.skill || ""}</Badge>
        </div>

        {emp.excluded && (
          <p className="excluded-note">
            <span>{emp.excludeReason}</span> — this agent can't swap or be swapped.
          </p>
        )}

        <BoardRows days={emp.week} highlightTodayTomorrow={false} staggerMs={30} />

        <h3 className="partners-subhead">Can legally swap weeks with</h3>
        {emp.excluded ? (
          <p className="partner-empty">Not eligible for swaps this week.</p>
        ) : partnerIds.length === 0 ? (
          <p className="partner-empty">
            No one else's draft week can be swapped with this agent's without breaking the 7-day or 12h-rest rules.
          </p>
        ) : (
          <div className="partner-list">
            {partnerIds.map((pid) => {
              const p = byId[pid];
              return (
                <div key={pid} className="partner-item" onClick={() => selectCompare(agentId, pid)}>
                  <span className="suggestion-name">{p.name}</span>
                  <span className="suggestion-skill">{p.skill || ""}</span>
                </div>
              );
            })}
          </div>
        )}
      </section>
    );
  }

  // status === 'pick'
  const first = data.draftDates[0];
  const last = data.draftDates[data.draftDates.length - 1];

  return (
    <section className="screen" id="screen-pick">
      <h1 className="hero-title">Find a swap.</h1>
      <p className="hero-sub">Pick an agent to see who they can trade their whole draft week with.</p>
      <p className="swap-week-note">Draft week: {formatDate(first)} – {formatDate(last)}</p>

      <SearchBox placeholder="Start typing a name…" fetchResults={fetchAgentResults} onSelect={selectAgent} />
    </section>
  );
}
