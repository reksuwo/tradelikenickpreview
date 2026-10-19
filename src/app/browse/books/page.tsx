import type { Metadata } from "next";
import { BookShelf } from "@/components/book-shelf";
import { getLibrary } from "@/lib/purchases";

export const metadata: Metadata = { title: "Books — TradeLikeNick" };

export default async function BooksPage() {
  const library = await getLibrary();
  return <BookShelf tone="dark" owned={library.books} />;
}
