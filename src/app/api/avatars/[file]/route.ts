import { NextResponse, type NextRequest } from "next/server";
import { getObject } from "@/lib/r2";

/**
 * Serves a profile photo a member uploaded (Avatars/<file> in R2). Photos
 * show to other members and admins, so there's no sign-in check. Every upload
 * gets a new file name, so a response never changes and can be cached forever.
 */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  if (!/^[\w-]+\.(?:webp|jpg|png)$/i.test(file)) return new NextResponse(null, { status: 404 });

  try {
    const object = await getObject(`Avatars/${file}`);
    if (!object) return new NextResponse(null, { status: 404 });
    return new NextResponse(object.body, {
      headers: {
        "Content-Type": object.contentType ?? "image/webp",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Loading profile photo failed", error);
    return new NextResponse(null, { status: 502 });
  }
}
