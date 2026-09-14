import { formatDate, localDateKey } from "@/lib/date";
import { Badge } from "@/components/ui/badge";

/**
 * Renders a list of schedule days as the original `.board-row` grid.
 * Mirrors the exact markup/classes previously produced imperatively in
 * app.js/profile.js/swap.js so the visual result is unchanged.
 */
export default function BoardRows({ days, highlightTodayTomorrow = true, staggerMs = 45 }) {
  if (!days || days.length === 0) return null;

  const todayKey = localDateKey(new Date());
  const tomorrowKey = localDateKey(new Date(Date.now() + 86400000));

  return (
    <div className="board-rows">
      {days.map((day, i) => {
        let barClass = "bar-other";
        let valueContent;

        if (day.type === "shift") {
          barClass = "bar-shift";
          const overnight = day.out <= day.in;
          valueContent = (
            <>
              <span className="time">{day.in}</span>
              <span className="arrow">→</span>
              <span className="time">{day.out}</span>
              {overnight && <span className="overnight">next day</span>}
            </>
          );
        } else if (day.type === "status") {
          barClass = day.code === "R" ? "bar-off" : day.code === "CP" ? "bar-leave" : "bar-other";
          valueContent = <span className="status-label">{day.label || day.code}</span>;
        } else {
          valueContent = (
            <span className="status-label">
              {day.in || ""} {day.out || ""}
            </span>
          );
        }

        let rowStateClass = "";
        let badge = null;
        if (highlightTodayTomorrow) {
          if (day.date === todayKey) {
            rowStateClass = "is-today";
            badge = <Badge className="row-badge badge-today">Today</Badge>;
          } else if (day.date === tomorrowKey) {
            rowStateClass = "is-tomorrow";
            badge = <Badge className="row-badge badge-tomorrow">Tomorrow</Badge>;
          }
        }

        return (
          <div
            key={day.date ?? i}
            className={`board-row ${rowStateClass}`}
            style={{ animationDelay: `${i * staggerMs}ms` }}
          >
            <div className="row-date">
              <span className="row-day">{day.dayName}</span>
              <span>{formatDate(day.date)}</span>
            </div>
            <div className={`row-bar ${barClass}`}></div>
            <div className="row-value">
              {valueContent}
              {badge}
            </div>
          </div>
        );
      })}
    </div>
  );
}
