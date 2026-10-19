import "server-only";
import { BOOKS } from "./books";
import { getCourse } from "./course-store";

/** Points at one sellable item. Safe to send from the browser: prices are looked up on the server. */
export type ProductRef = { type: "course" | "book"; id: string };

export type Product = ProductRef & {
  title: string;
  description: string;
  /** Price in US cents, as charged by Stripe. */
  cents: number;
};

/** "$697" → 69700, "$24.50" → 2450. Null for anything that isn't a dollar price, like "Included". */
export function priceCents(price: string) {
  const match = /^\$(\d+)(?:\.(\d{2}))?$/.exec(price.trim());
  return match ? Number(match[1]) * 100 + Number(match[2] ?? 0) : null;
}

/**
 * The catalogue item behind a ref, or null when it doesn't exist or isn't for
 * sale. Course prices come from the database, so admins can change them.
 */
export async function findProduct(ref: unknown): Promise<Product | null> {
  if (!ref || typeof ref !== "object") return null;
  const { type, id } = ref as Record<string, unknown>;
  if (typeof id !== "string") return null;

  const course = type === "course" ? await getCourse(id) : null;
  // Hidden courses can't be bought; people who already own one keep it.
  const item = type === "course" ? (course?.published ? course : null) : type === "book" ? BOOKS.find((b) => b.id === id) : undefined;
  if (!item) return null;

  const cents = priceCents(item.price);
  if (!cents) return null;

  return {
    type,
    id,
    title: item.title,
    description: "blurb" in item ? item.blurb : item.subtitle,
    cents,
  } as Product;
}
