import { BOOKS } from "./books";
import { COURSES } from "./courses";

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

/** The catalogue item behind a ref, or null when it doesn't exist or isn't for sale. */
export function findProduct(ref: unknown): Product | null {
  if (!ref || typeof ref !== "object") return null;
  const { type, id } = ref as Record<string, unknown>;
  if (typeof id !== "string") return null;

  const item =
    type === "course"
      ? COURSES.find((c) => c.id === id)
      : type === "book"
        ? BOOKS.find((b) => b.id === id)
        : undefined;
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
