"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { site } from "../../lib/config";

export default function QR() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [url, setUrl] = useState("");

  useEffect(() => {
    setUrl(window.location.origin + "/upload");
  }, []);

  useEffect(() => {
    if (!url || !canvasRef.current) return;

    let cancelled = false;

    void import("qrcode").then(({ default: QRCode }) => {
      if (cancelled || !canvasRef.current) return;

      return QRCode.toCanvas(canvasRef.current, url, {
        width: 360,
        margin: 2,
        errorCorrectionLevel: "M",
      });
    });

    return () => {
      cancelled = true;
    };
  }, [url]);

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
        <div className="qr">
          <span className="eyebrow">FOR YOUR GUESTS</span>
          <h1>Scan &amp; share</h1>
          <p>Display this QR code at the reception so guests can quickly add their favourite moments.</p>
          <div className="qr-frame">
            <canvas ref={canvasRef} />
          </div>
          <code>{url}</code>
          <Link className="button primary" href="/upload">Open upload page</Link>
        </div>
      </section>
    </main>
  );
}
