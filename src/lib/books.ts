// Placeholder catalogue — replace titles, prices and descriptions with the real books.

export type Book = {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  format: string;
  pages: number;
  price: string;
  /** Cover colours: [from, to] gradient and an accent for the artwork. */
  cover: [string, string];
  accent: string;
  art: "candles" | "curve" | "rings" | "grid" | "bars";
  badge?: string;
};

export const BOOKS: Book[] = [
  {
    id: "3m-framework",
    title: "The 3M Framework",
    subtitle: "Mindset, Method, Money management",
    category: "Foundations",
    format: "Ebook + PDF",
    pages: 148,
    price: "$29",
    cover: ["#062b1c", "#0b5a37"],
    accent: "#00ff85",
    art: "candles",
    badge: "Bestseller",
  },
  {
    id: "5-step-blueprint",
    title: "5-Step Trading Blueprint",
    subtitle: "From idea to executed trade",
    category: "Foundations",
    format: "Ebook + PDF",
    pages: 112,
    price: "$24",
    cover: ["#0b1f4a", "#1e4fd8"],
    accent: "#8cb4ff",
    art: "bars",
  },
  {
    id: "spx-gameplan",
    title: "The SPX Gameplan",
    subtitle: "Trading the index with a plan",
    category: "SPX",
    format: "Ebook + PDF",
    pages: 164,
    price: "$34",
    cover: ["#1a1033", "#5b2bd6"],
    accent: "#c4a8ff",
    art: "curve",
    badge: "New",
  },
  {
    id: "options-probability",
    title: "Options & Probability",
    subtitle: "Think in odds, not hunches",
    category: "Options",
    format: "Ebook + PDF",
    pages: 136,
    price: "$29",
    cover: ["#3a0d22", "#c2185b"],
    accent: "#ff9ec4",
    art: "rings",
  },
  {
    id: "greeks-simple",
    title: "The Greeks Made Simple",
    subtitle: "Delta, gamma, theta and vega",
    category: "Options",
    format: "Ebook + PDF",
    pages: 98,
    price: "$19",
    cover: ["#3d1a05", "#d9620f"],
    accent: "#ffc38c",
    art: "grid",
  },
  {
    id: "strategy-playbook",
    title: "The Strategy Playbook",
    subtitle: "Spreads, condors and when to use them",
    category: "Strategies",
    format: "Ebook + PDF",
    pages: 188,
    price: "$39",
    cover: ["#081110", "#1f2a28"],
    accent: "#00ff85",
    art: "curve",
  },
  {
    id: "risk-first",
    title: "Risk First",
    subtitle: "Position sizing that keeps you in the game",
    category: "Risk",
    format: "Ebook + PDF",
    pages: 104,
    price: "$24",
    cover: ["#3b2c00", "#b38600"],
    accent: "#ffe08a",
    art: "bars",
  },
  {
    id: "trading-journal",
    title: "The Trading Journal",
    subtitle: "A 90-day workbook",
    category: "Habits",
    format: "Printable workbook",
    pages: 120,
    price: "$17",
    cover: ["#04303a", "#0b8aa3"],
    accent: "#9ae8f7",
    art: "grid",
  },
  {
    id: "trading-psychology",
    title: "Calm Under Pressure",
    subtitle: "The psychology of disciplined trading",
    category: "Psychology",
    format: "Ebook + PDF",
    pages: 126,
    price: "$24",
    cover: ["#24123a", "#7a3fb0"],
    accent: "#e2c4ff",
    art: "rings",
  },
  {
    id: "spx-business",
    title: "The SPX Trading Business",
    subtitle: "Run your trading like a company",
    category: "SPX",
    format: "Ebook + PDF",
    pages: 172,
    price: "$39",
    cover: ["#0c0c0c", "#2b2b2b"],
    accent: "#ff4d5e",
    art: "candles",
  },
];

export const BOOK_CATEGORIES = ["All", ...Array.from(new Set(BOOKS.map((b) => b.category)))];
