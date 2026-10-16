import type { Metadata } from "next";
import { BookShelf } from "@/components/book-shelf";

export const metadata: Metadata = { title: "Books — TradeLikeNick" };

export default function BooksPage() {
  return <BookShelf tone="dark" />;
}
