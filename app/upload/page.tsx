"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BUCKET, supabase } from "../../lib/supabase";

export default function Upload() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [caption, setCaption] = useState("");
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!file) {
      setPreview("");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();

    if (!file) {
      setError("Choose a photo first.");
      return;
    }

    if (!file.type.startsWith("image/") || file.size > 15 * 1024 * 1024) {
      setError("Please choose an image up to 15 MB.");
      return;
    }

    setStatus("uploading");
    setError("");

    const extension =
      (file.name.split(".").pop() || "jpg")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "") || "jpg";

    const path = crypto.randomUUID() + "." + extension;

    const uploadResult = await supabase.storage
      .from(BUCKET)
      .upload(path, file, {
        cacheControl: "31536000",
        contentType: file.type || "image/jpeg",
        upsert: false,
      });

    if (uploadResult.error) {
      setError(uploadResult.error.message);
      setStatus("error");
      return;
    }

    const insertResult = await supabase
      .from("laura_jack_polaroids")
      .insert({
        image_url: path,
        caption: caption.trim().substring(0, 10) || null,
      });

    if (insertResult.error) {
      await supabase.storage.from(BUCKET).remove([path]);
      setError(insertResult.error.message);
      setStatus("error");
      return;
    }

    setStatus("success");
    setFile(null);
    setCaption("");
  }

  return (
    <main>
      <header className="site-header">
        <Link className="brand" href="/">
          <span className="brand-script">Laura &amp; Jack</span>
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
        <p className="lead">
          Upload a photo from Laura &amp; Jack&apos;s wedding. No account or login is required.
        </p>

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
                onChange={(event) => {
                  const selected = event.target.files?.[0];
                  if (selected) {
                    setFile(selected);
                    setError("");
                  }
                }}
              />
            </label>

            {preview && (
              <button type="button" className="linkbtn" onClick={() => setFile(null)}>
                Choose a different photo
              </button>
            )}

            <label className="field">
              Caption <em>optional · max 10 characters</em>
              <input
                value={caption}
                onChange={(event) => setCaption(event.target.value)}
                maxLength={10}
                placeholder="e.g. LOVE U"
              />
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
