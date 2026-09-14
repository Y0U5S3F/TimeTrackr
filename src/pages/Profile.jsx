import { useEffect, useState } from "react";
import SearchBox from "@/components/SearchBox";
import BoardRows from "@/components/BoardRows";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fetchJson } from "@/lib/api";

const STORAGE_KEY = "esc_ra_employee_id";

async function fetchSearch(q) {
  try {
    return await fetchJson(`/api/search?q=${encodeURIComponent(q)}`);
  } catch {
    return [];
  }
}

export default function Profile() {
  const [screen, setScreen] = useState("loading"); // 'loading' | 'setup' | 'board'
  const [board, setBoard] = useState(null);

  async function loadSavedProfile(id) {
    try {
      const data = await fetchJson(`/api/employee?id=${encodeURIComponent(id)}`);
      setBoard(data);
      setScreen("board");
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      setScreen("setup");
    }
  }

  useEffect(() => {
    const savedId = localStorage.getItem(STORAGE_KEY);
    if (savedId) loadSavedProfile(savedId);
    else setScreen("setup");
  }, []);

  function saveAndLoad(id) {
    localStorage.setItem(STORAGE_KEY, id);
    setScreen("loading");
    loadSavedProfile(id);
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY);
    setBoard(null);
    setScreen("setup");
  }

  if (screen === "loading") return null;

  if (screen === "board" && board) {
    return (
      <section className="screen" id="screen-board">
        <div className="mb-6 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="m-0 font-display text-[30px] font-black uppercase tracking-tight text-foreground">{board.employee.name}</h2>
          <Badge variant="outline">{board.employee.skill || ""}</Badge>
        </div>

        {board.days.length === 0 ? (
          <p className="py-6 text-sm text-[var(--text-faint)]">No schedule on file for this person yet.</p>
        ) : (
          <BoardRows days={board.days} />
        )}

        <Button variant="link" className="mt-6 font-mono text-[13px] text-[var(--text-faint)] hover:text-muted-foreground" onClick={logout}>
          Log out (forget me on this device)
        </Button>
      </section>
    );
  }

  return (
    <section className="screen" id="screen-setup">
      <h1 className="m-0 mb-2.5 font-display text-[44px] max-[480px]:text-[34px] font-black uppercase leading-[1.02] tracking-tight text-foreground">
        Set up your profile.
      </h1>
      <p className="mb-8 font-mono text-sm text-muted-foreground">
        Save your name once — this page will remember you and jump straight to your schedule.
      </p>

      <SearchBox placeholder="Start typing your name" fetchResults={fetchSearch} onSelect={saveAndLoad} />
      <p className="mt-2.5 ml-0.5 text-xs text-[var(--text-faint)]">
        Pick yourself from the list — this device will stay signed in as you.
      </p>
    </section>
  );
}
