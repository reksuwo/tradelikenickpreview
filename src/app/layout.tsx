import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TradeLikeNick — Nine trading courses, streaming in one library",
  description:
    "Nine trading courses streaming in one library: setups, risk sizing, psychology and live sessions. Make a free account, watch the opening episodes, buy only what you want.",
  openGraph: {
    title: "TradeLikeNick — Trading courses, streaming",
    description:
      "Nine courses, 163 hours, weekly live sessions. Watch the opening episodes free.",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jakarta.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-white font-sans text-ink">
        {children}
      </body>
    </html>
  );
}
