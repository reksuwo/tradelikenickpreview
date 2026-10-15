import type { Metadata } from "next";
import { BrowseHome } from "@/components/browse/browse-home";

export const metadata: Metadata = {
  title: "Home — TradeLikeNick",
  description: "Your TradeLikeNick library: pick up where you left off or start something new.",
};

export default function BrowsePage() {
  return <BrowseHome />;
}
