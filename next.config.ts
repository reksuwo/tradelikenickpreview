import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Send common guesses for the auth pages to the real ones.
  async redirects() {
    return [
      { source: "/sign-up", destination: "/signup", permanent: true },
      { source: "/register", destination: "/signup", permanent: true },
      { source: "/sign-in", destination: "/signin", permanent: true },
      { source: "/login", destination: "/signin", permanent: true },
    ];
  },
};

export default nextConfig;
