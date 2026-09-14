import { useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { formatDate } from "@/lib/date";

const MAX_FILE_BYTES = 3 * 1024 * 1024; // keep in sync with api/upload.js

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  let binary = "";
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

export default function Upload() {
  const [password, setPassword] = useState("");
  const [file, setFile] = useState(null);
  const [mode, setMode] = useState("final");
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState(null); // { type: 'success'|'error', text }
  const [history, setHistory] = useState(null); // array | null
  const [formKey, setFormKey] = useState(0); // bump to reset file input

  async function loadHistory(pw) {
    try {
      const res = await fetch("/api/history", { headers: { "x-upload-password": pw } });
      if (!res.ok) return;
      const items = await res.json();
      if (items.length === 0) return;
      setHistory(items);
    } catch {
      /* quiet */
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg(null);

    if (file && file.size > MAX_FILE_BYTES) {
      setMsg({ type: "error", text: `File too large (max ${MAX_FILE_BYTES / (1024 * 1024)}MB).` });
      return;
    }

    setSubmitting(true);
    try {
      const buffer = await file.arrayBuffer();
      const fileBase64 = arrayBufferToBase64(buffer);

      const res = await fetch("/api/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-upload-password": password,
        },
        body: JSON.stringify({ filename: file.name, fileBase64, mode }),
      });

      const raw = await res.text();
      let data;
      try {
        data = JSON.parse(raw);
      } catch {
        throw new Error(
          `Server error (${res.status}). Check the Vercel function logs for /api/upload.`
        );
      }

      if (!res.ok) throw new Error(data.error || "Upload failed");

      const dates = data.datesAffected.map(formatDate).join(", ");
      setMsg({
        type: "success",
        text: `Published. ${data.employeeCount} people tracked now. Dates updated: ${dates}.`,
      });
      setPassword("");
      setFile(null);
      setMode("final");
      setFormKey((k) => k + 1);
      loadHistory(password);
    } catch (err) {
      setMsg({ type: "error", text: err.message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
    <div className="boardglow" aria-hidden="true"></div>
    <header className="topbar">
      <div className="wrap topbar-inner">
        <Link to="/" className="wordmark">
          <span className="wordmark-dot"></span>ESC_RA Timeline
        </Link>
        <span className="topbar-sub">Upload</span>
      </div>
    </header>
    <main className="wrap">
    <section className="screen">
      <h1 className="hero-title">Upload a schedule.</h1>
      <p className="hero-sub">
        Dates already on file get replaced entirely by whatever's in the new file — no leftover conflicts.
      </p>

      <Card className="upload-panel">
        <form key={formKey} onSubmit={handleSubmit}>
          <div className="field">
            <Label htmlFor="password">Password</Label>
            <Input
              type="password"
              id="password"
              name="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="field">
            <Label htmlFor="file">Schedule file (.xlsx)</Label>
            <Input
              type="file"
              id="file"
              name="file"
              accept=".xlsx,.xlsm"
              required
              onChange={(e) => setFile(e.target.files[0])}
            />
            <span className="field-hint">Max 3MB.</span>
          </div>
          <div className="field">
            <Label>Upload type</Label>
            <RadioGroup value={mode} onValueChange={setMode}>
              <div className="field-radio-row">
                <RadioGroupItem value="final" id="mode-final" />
                <Label htmlFor="mode-final">Final</Label>
              </div>
              <div className="field-radio-row">
                <RadioGroupItem value="draft" id="mode-draft" />
                <Label htmlFor="mode-draft">Draft</Label>
              </div>
            </RadioGroup>
            <span className="field-hint">
              Draft is stored separately and only ever keeps the latest week — it doesn't touch the published schedule.
            </span>
          </div>
          <Button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? "Uploading…" : "Upload & publish"}
          </Button>
        </form>
        {msg && <Alert variant={msg.type}>{msg.text}</Alert>}
      </Card>

      {history && history.length > 0 && (
        <div className="upload-history">
          <h3>Recent uploads</h3>
          <div>
            {history.map((it, i) => (
              <div className="upload-history-item" key={i}>
                <span className="fn">{it.filename}</span> — {it.datesAffected.length} dates (
                {it.datesAffected.map(formatDate).join(", ")}) · {new Date(it.uploadedAt).toLocaleString("en-GB")}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
    </main>
    <footer className="footer">
      <div className="wrap footer-inner">
        <span>This page isn't linked from search — keep the URL to yourself.</span>
        <Link to="/">← Back to search</Link>
      </div>
    </footer>
    </>
  );
}
