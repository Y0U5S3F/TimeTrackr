import { useState, useEffect, useRef } from "react";
import { Hexagon, Clock, ChevronRight } from "lucide-react";

/**
 * TimeTrackr — dark HUD-themed hero section
 * Palette: bg #0A0C10, surface #14171C, accent #38BDF8, border #23272F, muted #8A929E
 * Type: system sans, tight tracking on labels, heavy display weight on headline
 */

const NAV_ITEMS = ["Track", "Insights", "Teams", "Reports"];

function NetworkField() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let raf;
    const nodes = Array.from({ length: 26 }, () => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.0006,
      vy: (Math.random() - 0.5) * 0.0006,
    }));

    function resize() {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    }
    resize();
    window.addEventListener("resize", resize);

    function draw() {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      nodes.forEach((n) => {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > 1) n.vx *= -1;
        if (n.y < 0 || n.y > 1) n.vy *= -1;
      });
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = (a.x - b.x) * w;
          const dy = (a.y - b.y) * h;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < w * 0.16) {
            ctx.strokeStyle = `rgba(148,163,184,${0.14 * (1 - dist / (w * 0.16))})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x * w, a.y * h);
            ctx.lineTo(b.x * w, b.y * h);
            ctx.stroke();
          }
        }
      }
      nodes.forEach((n) => {
        ctx.fillStyle = "rgba(226,232,240,0.55)";
        ctx.beginPath();
        ctx.arc(n.x * w, n.y * h, 1.6, 0, Math.PI * 2);
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-x-0 bottom-0 h-40 w-full opacity-70" />;
}

function StatOrb({ value, unit, label, tag, size = 168 }) {
  return (
    <div className="flex items-center gap-5">
      <div
        className="relative flex shrink-0 items-center justify-center rounded-full bg-white"
        style={{ width: size, height: size }}
      >
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold tracking-tight text-[#0A0C10]">{value}</span>
          {unit && <span className="text-sm font-medium text-[#0A0C10]/70">{unit}</span>}
        </div>
      </div>
      {label && (
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-white">{label}</p>
          <span className="mt-1 inline-block rounded-sm bg-[#1B1F26] px-1.5 py-0.5 text-[10px] font-medium tracking-wide text-[#8A929E]">
            {tag}
          </span>
        </div>
      )}
    </div>
  );
}

export default function TimeTrackrHero() {
  const [active, setActive] = useState("Insights");

  return (
    <div className="min-h-screen w-full bg-[#0A0C10] font-sans text-white">
      {/* Nav */}
      <header className="border-b border-[#23272F] bg-[#F5F6F7]">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-1 text-lg font-bold text-[#0A0C10]">
            <div className="rounded-sm bg-[#0A0C10] px-2 py-1 text-sm tracking-wide text-white">TIME</div>
            <span>Trackr</span>
          </div>
          <nav className="hidden items-center gap-10 text-sm font-semibold tracking-wide text-[#3A3F47] sm:flex">
            {NAV_ITEMS.map((item) => (
              <button
                key={item}
                onClick={() => setActive(item)}
                className={`relative flex items-center gap-1.5 py-1 uppercase transition-colors hover:text-[#0A0C10] ${
                  active === item ? "text-[#0A0C10]" : ""
                }`}
              >
                {active === item && <span className="h-1.5 w-1.5 rounded-sm bg-[#38BDF8]" />}
                {item}
              </button>
            ))}
          </nav>
        </div>
        <div className="h-[3px] w-full bg-gradient-to-r from-[#38BDF8] via-[#38BDF8]/40 to-transparent" />
      </header>

      {/* Hero */}
      <main className="relative overflow-hidden">
        {/* dot texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage: "radial-gradient(rgba(255,255,255,0.18) 1px, transparent 1px)",
            backgroundSize: "42px 42px",
          }}
        />

        <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-y-14 px-6 pb-40 pt-16 lg:grid-cols-[minmax(0,300px)_1fr]">
          {/* left column: title block + hex mark */}
          <div>
            <div className="mb-8 h-9 w-36 rounded-sm bg-[#2A2E36]">
              <div className="h-[3px] w-full translate-y-9 bg-[#38BDF8]" />
            </div>
            <h1 className="text-5xl font-extrabold tracking-tight text-white">Hours</h1>

            <div className="mt-10 flex items-center gap-2">
              <button className="flex h-9 w-9 items-center justify-center rounded-sm bg-[#38BDF8] text-[#0A0C10]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#0A0C10]" />
              </button>
              {[2, 3, 4].map((n) => (
                <button
                  key={n}
                  className="flex h-9 w-9 items-center justify-center rounded-sm bg-[#1B1F26] text-[#8A929E] hover:bg-[#23272F]"
                >
                  <span className="text-xs tracking-tighter">{Array(n - 1).fill("\u00B7").join("")}</span>
                </button>
              ))}
            </div>

            <div className="mt-16 flex items-center gap-2 text-xs font-medium tracking-wide text-[#8A929E]">
              <Clock className="h-3.5 w-3.5 text-[#38BDF8]" />
              SYNCED ACROSS ALL DEVICES
            </div>
          </div>

          {/* right column: copy + stats, mirrors reference layout */}
          <div className="lg:pt-2">
            <div className="flex items-start justify-between gap-8">
              <div className="max-w-2xl">
                <p className="text-sm font-medium uppercase tracking-[0.15em] text-[#8A929E]">
                  Without <span className="text-white">TimeTrackr</span>
                </p>
                <h2 className="mt-3 text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl">
                  Untracked hours drain your team&rsquo;s focus and your project&rsquo;s budget.
                </h2>
              </div>
              <div className="hidden shrink-0 flex-col items-center gap-2 sm:flex">
                <Hexagon className="h-14 w-14 text-white" strokeWidth={1.25} />
                <span className="text-xs font-bold tracking-[0.2em] text-white">TIMETRACKR</span>
              </div>
            </div>

            <button className="mt-10 flex items-center justify-between gap-6 border border-white bg-white px-7 py-3.5 text-sm font-bold uppercase tracking-wide text-[#0A0C10] transition-colors hover:bg-[#E7E9EC]">
              Start tracking free
              <ChevronRight className="h-4 w-4" />
            </button>
            <div className="mt-2 h-[3px] w-full max-w-[19.5rem] bg-[#38BDF8]" />

            <div className="mt-16 flex flex-wrap items-center gap-x-16 gap-y-10">
              <StatOrb value="6.4" unit="hrs" label="Lost per week" tag="TEAM AVERAGE" />
              <StatOrb value="31" unit="%" label="Missed deadlines" tag="LAST QUARTER" />
            </div>

            <div className="mt-24 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#22C55E]" />
              <span className="text-xs font-semibold uppercase tracking-wide text-[#8A929E]">
                Live sync active
              </span>
            </div>
          </div>
        </div>

        <NetworkField />
      </main>
    </div>
  );
}
