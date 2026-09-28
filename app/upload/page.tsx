"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { site } from "../../lib/config";

export default function Upload() {
  const [f, setF] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [name, setName] = useState("");
  const [msg, setMsg] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!f) {
      setPreview("");
      return;
    }
    const u = URL.createObjectURL(f);
    setPreview(u);
    return () => URL.revokeObjectURL(u);
  }, [f]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!f) {
      setError("Choose a photo first.");
      return;
    }
    if (!f.type.startsWith("image/") || f.size > 15 * 1024 * 1024) {
      setError("Please choose an image up to 15 MB.");
      return;
    }
    setStatus("uploading");
    setError("");

    const body = new FormData();
    body.set("photo", f);
    if (name.trim()) body.set("guestName", name.trim());
    if (msg.trim()) body.set("message", msg.trim());

    const res = await fetch("/api/photos", { method: "POST", body });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Upload failed. Please try again.");
      setStatus("error");
      return;
    }

    setStatus("success");
    setF(null);
    setName("");
    setMsg("");
  }

  return (
    <main>
      <header className="site-header">
        <Link className="brand" href="/">
          <span className="brand-script">{site.coupleOne} &amp; {site.coupleTwo}</span>
          <span className="brand-subtitle">OUR WEDDING MEMORIES</span>
        </Link>
        <nav>
          <Link href="/">Wall</Link>
          <Link href="/upload">Share a photo</Link>
          <Link href="/qr">QR code</Link>
        </nav>
      </header>

      <section className="shell">
        <Link className="back" href="/">← Back to the wall</Link>
        <span className="eyebrow">SHARE THE MOMENT</span>
        <h1>Add a memory</h1>
        <p className="lead">Upload a photo from the celebration. No account or login is required.</p>

        {status === "success" ? (
          <div className="success">
            <h2>Memory shared!</h2>
            <p>Your photo is now part of the wall.</p>
            <Link className="button primary" href="/">View the wall</Link>
          </div>
        ) : (
          <form className="form" onSubmit={submit}>
            <label className="drop">
              {preview ? (
                <img src={preview} alt="Selected photo preview" />
              ) : (
                <>
                  <b>↑</b>
                  <strong>Choose a photo</strong>
                  <span>Camera or photo library · up to 15 MB</span>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) => {
                  const x = e.target.files?.[0];
                  if (x) {
                    setF(x);
                    setError("");
                  }
                }}
              />
            </label>
            {preview && (
              <button type="button" className="linkbtn" onClick={() => setF(null)}>
                Choose a different photo
              </button>
            )}
            <label className="field">
              Your name <em>optional</em>
              <input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} placeholder="e.g. Sarah & Tom" />
            </label>
            <label className="field">
              A little note <em>optional</em>
              <textarea value={msg} onChange={(e) => setMsg(e.target.value)} maxLength={300} rows={3} placeholder="A memory, a toast, or just some love…" />
            </label>
            {error && <p className="error">{error}</p>}
            <button className="button primary full" disabled={status === "uploading"}>
              {status === "uploading" ? "Sharing your memory…" : "Share on the wall"}
            </button>
            <small>Please only share photos you’re happy for wedding guests to see.</small>
          </form>
        )}
      </section>
    </main>
  );
}
