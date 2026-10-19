import { NextResponse, type NextRequest } from "next/server";
import { BOOKS } from "@/lib/books";
import { getLibrary } from "@/lib/purchases";
import { objectExists, signedUrl } from "@/lib/r2";
import { getUser } from "@/lib/supabase/server";

/**
 * Sends a member who owns the book to a five-minute download link for its PDF
 * in R2 (Books/<book id>.pdf). Everyone else is turned away.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const book = BOOKS.find((b) => b.id === id);
  const back = (query: string) => NextResponse.redirect(new URL(`/account/books${query}`, request.nextUrl.origin));

  if (!(await getUser())) {
    return NextResponse.redirect(new URL(`/signin?next=${encodeURIComponent("/account/books")}`, request.nextUrl.origin));
  }
  if (!book || !(await getLibrary()).books.includes(book.id)) return back("");

  try {
    const key = `Books/${book.id}.pdf`;
    if (!(await objectExists(key))) return back(`?missing=${book.id}`);
    return NextResponse.redirect(await signedUrl(key, { expiresIn: 60 * 5, downloadName: `${book.title}.pdf` }));
  } catch (error) {
    console.error("Book download failed", error);
    return back(`?missing=${book.id}`);
  }
}
