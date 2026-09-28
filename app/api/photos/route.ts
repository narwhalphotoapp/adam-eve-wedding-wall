import { NextRequest, NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "../../../db/index";
import { photos } from "../../../db/schema";
import { photoStore } from "../../../lib/photoStore";

export const dynamic = "force-dynamic";

const MAX_SIZE = 15 * 1024 * 1024;

function toPhoto(row: typeof photos.$inferSelect) {
  return {
    id: row.id,
    guestName: row.guestName,
    message: row.message,
    createdAt: row.createdAt,
    url: `/api/photos/${row.id}/image`,
  };
}

export async function GET() {
  const rows = await db.select().from(photos).orderBy(desc(photos.createdAt)).limit(200);
  return NextResponse.json(rows.map(toPhoto));
}

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const file = form.get("photo");
  const guestName = String(form.get("guestName") || "").trim().slice(0, 80) || null;
  const message = String(form.get("message") || "").trim().slice(0, 300) || null;

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Choose a photo first." }, { status: 400 });
  }
  if (!file.type.startsWith("image/") || file.size > MAX_SIZE) {
    return NextResponse.json({ error: "Please choose an image up to 15 MB." }, { status: 400 });
  }

  const [row] = await db.insert(photos).values({ guestName, message }).returning();

  try {
    const bytes = await file.arrayBuffer();
    await photoStore().set(row.id, bytes, {
      metadata: { contentType: file.type || "image/jpeg" },
    });
  } catch {
    await db.delete(photos).where(eq(photos.id, row.id));
    return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 500 });
  }

  return NextResponse.json(toPhoto(row), { status: 201 });
}
