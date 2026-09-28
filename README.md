# Adam & Eve Wedding Wall

A premium, mobile-first wedding photo wall built with Next.js and TypeScript, running on Netlify Database and Netlify Blobs.

## Pages

- / — public memory wall, polling for new photos every few seconds
- /upload — guest upload from camera or photo library
- /qr — reception QR code linking to the upload page

## How it works

- Photo bytes are stored in Netlify Blobs (`wedding-photos` store), keyed by the photo's database id.
- Guest name, note, and timestamp are stored in Netlify Database (Postgres via Drizzle) in the `photos` table.
- `/api/photos` lists recent photos (GET) and accepts new uploads (POST, multipart form).
- `/api/photos/[id]/image` streams the photo bytes back with the right content type.

The couple's names and tagline are set in `lib/config.ts` — edit that file to personalize the wall.

## Local development

```bash
npm install
npm run dev
```

Validation commands:

```bash
npm run typecheck
npm run build
```
