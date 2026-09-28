"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { site } from "../lib/config";
import type { Photo } from "../lib/types";

const rot = (id: string) => {
  let n = 0;
  for (const c of id) n = (n * 31 + c.charCodeAt(0)) >>> 0;
  return [-3, 2.3, -1.5, 3, -2, 1.4, -3.5, 2.8][n % 8];
};
const tape = (id: string) => {
  let n = 0;
  for (const c of id) n = (n * 17 + c.charCodeAt(0)) >>> 0;
  return n % 3;
};

export default function Home() {
  const [p, setP] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const inFlight = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (inFlight.current) return;
      inFlight.current = true;
      try {
        const res = await fetch("/api/photos", { cache: "no-store" });
        if (res.ok && !cancelled) {
          setP(await res.json());
        }
      } finally {
        inFlight.current = false;
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    const id = setInterval(load, 5000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

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

      <section className="hero">
        <span className="eyebrow">THE DAY WE’LL ALWAYS REMEMBER</span>
        <h1>{site.coupleOne} <span>&amp;</span> {site.coupleTwo}</h1>
        <p>{site.tagline}</p>
        <div className="actions">
          <Link className="button primary" href="/upload">Add your photo</Link>
          <Link className="button quiet" href="/qr">Show QR code</Link>
        </div>
      </section>

      <section className="wall">
        <div className="head">
          <div>
            <span className="eyebrow">LIVE FROM OUR GUESTS</span>
            <h2>The memory wall</h2>
          </div>
          <span className="live"><i /> Live</span>
        </div>
        {loading ? (
          <div className="empty">Gathering your memories…</div>
        ) : p.length === 0 ? (
          <div className="empty">
            <strong>Your first memory belongs here.</strong>
            <p>Be the first to share a photo from the celebration.</p>
            <Link className="button primary" href="/upload">Share a photo</Link>
          </div>
        ) : (
          <div className="grid">
            {p.map((x) => (
              <article
                className={"card tape-" + tape(x.id)}
                key={x.id}
                style={{ "--r": rot(x.id) } as React.CSSProperties}
              >
                <div className="pic">
                  <img
                    src={x.url}
                    alt={x.guestName ? "Photo shared by " + x.guestName : "Wedding memory"}
                    loading="lazy"
                  />
                </div>
                {(x.guestName || x.message) && (
                  <div className="caption">
                    {x.guestName && <b>{x.guestName}</b>}
                    {x.message && <span>{x.message}</span>}
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      <footer>
        <span>Made with love for {site.coupleOne} &amp; {site.coupleTwo}</span>
        <Link href="/upload">Share a memory →</Link>
      </footer>
    </main>
  );
}
