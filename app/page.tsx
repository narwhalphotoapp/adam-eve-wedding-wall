"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { photoUrl, supabase } from "../lib/supabase";
import type { Photo } from "../lib/types";

const rotations = [-3, 2.3, -1.5, 3, -2, 1.4, -3.5, 2.8];
const rotationFor = (id: number) => rotations[id % rotations.length];

export default function Home() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void supabase
      .from("laura_jack_polaroids")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200)
      .then(({ data, error }) => {
        if (error) console.error(error);
        else setPhotos(data ?? []);
        setLoading(false);
      });

    const channel = supabase
      .channel("laura-jack-wall")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "laura_jack_polaroids" },
        (payload) => {
          const photo = payload.new as Photo;
          setPhotos((current) => {
            const withoutDuplicate = current.filter((p) => p.id !== photo.id);
            return [photo, ...withoutDuplicate].slice(0, 200);
          });
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

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

      <section className="hero">
        <span className="eyebrow">THE DAY WE’LL ALWAYS REMEMBER</span>
        <h1>Laura <span>&amp;</span> Jack</h1>
        <p>Capture the moments, share the memories, and fill our wall with love.</p>
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
        ) : photos.length === 0 ? (
          <div className="empty">
            <strong>Your first memory belongs here.</strong>
            <p>Be the first to share a photo from the celebration.</p>
            <Link className="button primary" href="/upload">Share a photo</Link>
          </div>
        ) : (
          <div className="grid">
            {photos.map((photo) => (
              <article
                className="card"
                key={photo.id}
                style={{ "--r": rotationFor(photo.id) } as React.CSSProperties}
              >
                <div className="pic">
                  <img
                    src={photoUrl(photo.image_url)}
                    alt="Laura and Jack wedding memory"
                    loading="lazy"
                  />
                </div>
                {photo.caption && (
                  <div className="caption">
                    <span>{photo.caption}</span>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      <footer>
        <span>Made with love for Laura &amp; Jack</span>
        <Link href="/upload">Share a memory →</Link>
      </footer>
    </main>
  );
}
