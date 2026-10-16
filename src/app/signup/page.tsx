import type { Metadata } from "next";
import { AuthPage } from "@/components/auth/auth-page";

export const metadata: Metadata = {
  title: "Create an account — TradeLikeNick",
  description: "Make a free account, watch the opening episodes, buy only what you want.",
};

export default function SignUpPage({ searchParams }: PageProps<"/signup">) {
  return <AuthPage mode="signup" searchParams={searchParams} />;
}
