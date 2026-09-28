import { NextResponse } from "next/server";
import { photoStore } from "../../../../../lib/photoStore";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await photoStore().getWithMetadata(id, { type: "arrayBuffer" });

  if (!result) {
    return new NextResponse("Not found", { status: 404 });
  }

  const contentType = (result.metadata?.contentType as string) || "application/octet-stream";

  return new NextResponse(result.data as ArrayBuffer, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
