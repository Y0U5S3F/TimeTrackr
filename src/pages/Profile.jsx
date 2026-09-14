import { useEffect, useState } from "react";
import SearchBox from "@/components/SearchBox";
import BoardRows from "@/components/BoardRows";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "esc_ra_employee_id";

async function fetchSearch(q) {
  try {
    const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
    return await res.json();
  } catch {
    return [];
  }
}

export default function Profile() {
  const [screen, setScreen] = useState("loading"); // 'loading' | 'setup' | 'board'
  const [board, setBoard] = useState(null);

  async function loadSavedProfile(id) {
    try {
      const res = await fetch(`/api/employee/${encodeURIComponent(id)}`);
      if (!res.ok) throw new Error("not found");
      const data = await res.json();
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
        <div className="board-header">
          <h2>{board.employee.name}</h2>
          <Badge className="board-skill">{board.employee.skill || ""}</Badge>
        </div>

        {board.days.length === 0 ? (
          <p className="board-empty">No schedule on file for this person yet.</p>
        ) : (
          <BoardRows days={board.days} />
        )}

        <Button variant="link" className="back-btn" onClick={logout}>
          Log out (forget me on this device)
        </Button>
      </section>
    );
  }

  return (
    <section className="screen" id="screen-setup">
      <h1 className="hero-title">Set up your profile.</h1>
      <p className="hero-sub">Save your name once — this page will remember you and jump straight to your schedule.</p>

      <SearchBox
        placeholder="Start typing your name"
        fetchResults={fetchSearch}
        onSelect={saveAndLoad}
      />
      <p className="search-hint">Pick yourself from the list — this device will stay signed in as you.</p>
    </section>
  );
}
