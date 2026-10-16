import type { Metadata } from "next";
import { AuthPage } from "@/components/auth/auth-page";

export const metadata: Metadata = {
  title: "Sign in — TradeLikeNick",
  description: "Sign in to watch your courses and pick up where you left off.",
};

export default function SignInPage({ searchParams }: PageProps<"/signin">) {
  return <AuthPage mode="signin" searchParams={searchParams} />;
}
