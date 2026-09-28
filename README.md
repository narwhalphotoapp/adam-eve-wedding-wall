# Adam & Eve Wedding Wall

A premium, mobile-first wedding photo wall built with Next.js, TypeScript and Supabase.

## Pages

- / — live public memory wall with Supabase Realtime
- /upload — guest upload from camera or photo library
- /qr — reception QR code linking to the upload page

## Supabase

The app uses the existing `wedding_settings`, `photos`, and `wedding-photos` storage bucket. Existing RLS policies and Realtime configuration were preserved.

Set these environment variables in Vercel:

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_PUBLISHABLE_OR_ANON_KEY
```

The couple names, tagline and event date are read from `wedding_settings`, so the wedding details can be changed in Supabase without editing the app.

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

Do not add a service-role key to the frontend or to `NEXT_PUBLIC_*` variables.
