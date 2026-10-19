import { NextResponse, type NextRequest } from "next/server";
import { getObject } from "@/lib/r2";

/**
 * Serves a lecture thumbnail uploaded from the admin panel (Thumbnails/<file>
 * in R2). Thumbnails aren't secret, so there's no sign-in check. Every upload
 * gets a new file name, so a response never changes and can be cached forever.
 */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  if (!/^[\w-]+\.(?:webp|jpe?g|png)$/i.test(file)) return new NextResponse(null, { status: 404 });

  try {
    const object = await getObject(`Thumbnails/${file}`);
    if (!object) return new NextResponse(null, { status: 404 });
    return new NextResponse(object.body, {
      headers: {
        "Content-Type": object.contentType ?? "image/webp",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Loading thumbnail failed", error);
    return new NextResponse(null, { status: 502 });
  }
}
