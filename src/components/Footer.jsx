import { Link } from "react-router-dom";

export default function Footer({ variant = "default" }) {
  if (variant === "upload") {
    return (
      <footer className="footer">
        <div className="wrap footer-inner">
          <span>This page isn't linked from search — keep the URL to yourself.</span>
          <Link to="/">← Back to search</Link>
        </div>
      </footer>
    );
  }

  return (
    <footer className="footer">
      <div className="wrap footer-inner">
        <span>Powered by 7355608 Spreadsheets</span>
        <Link to="/upload">Upload a schedule →</Link>
      </div>
    </footer>
  );
}
