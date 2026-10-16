import { signInWithProvider } from "@/lib/auth-actions";

const PROVIDERS = [
  {
    id: "google",
    label: "Google",
    path: "M21.6 12.2c0-.7-.1-1.3-.2-1.9H12v3.7h5.4a4.6 4.6 0 01-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3z M12 22c2.7 0 5-.9 6.6-2.5l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0012 22z M6.4 13.9a6 6 0 010-3.8V7.5H3.1a10 10 0 000 9l3.3-2.6z M12 5.9c1.5 0 2.8.5 3.8 1.5l2.8-2.8A10 10 0 003.1 7.5l3.3 2.6C7.2 7.7 9.4 5.9 12 5.9z",
  },
  {
    id: "apple",
    label: "Apple",
    path: "M16.4 12.7c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.1-2.8.9-3.5.9-.7 0-1.8-.9-3-.8-1.5 0-2.9.9-3.7 2.3-1.6 2.7-.4 6.8 1.1 9 .8 1.1 1.7 2.3 2.9 2.2 1.2 0 1.6-.7 3-.7s1.8.7 3 .7c1.3 0 2.1-1.1 2.8-2.2.9-1.3 1.3-2.5 1.3-2.6 0 0-2.5-1-2.5-3.5z M14.3 5.9c.6-.8 1.1-1.9 1-3-.9 0-2.1.6-2.8 1.4-.6.7-1.2 1.8-1 2.9 1 .1 2.1-.5 2.8-1.3z",
  },
] as const;

/**
 * Asks Supabase which social providers are switched on, so a button only
 * shows once its provider is enabled in the dashboard.
 */
async function enabledProviders(): Promise<Set<string>> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return new Set();
  try {
    const res = await fetch(`${url}/auth/v1/settings`, { headers: { apikey: key } });
    if (!res.ok) return new Set();
    const settings: { external?: Record<string, boolean> } = await res.json();
    return new Set(
      Object.entries(settings.external ?? {})
        .filter(([, on]) => on)
        .map(([id]) => id),
    );
  } catch {
    return new Set();
  }
}

export async function SocialButtons({ next }: { next: string }) {
  const enabled = await enabledProviders();
  const providers = PROVIDERS.filter((p) => enabled.has(p.id));
  if (providers.length === 0) return <div className="mt-8" />;

  return (
    <>
      <form action={signInWithProvider} className="mt-8 grid gap-3 sm:grid-cols-2">
        <input type="hidden" name="next" value={next} />
        {providers.map((p) => (
          <button
            key={p.id}
            type="submit"
            name="provider"
            value={p.id}
            className="inline-flex items-center justify-center gap-2.5 rounded-xl border border-edge bg-card px-4 py-3 text-[14.5px] font-semibold text-fg transition-all duration-200 hover:-translate-y-0.5 hover:border-fg/25 hover:shadow-card"
          >
            <svg viewBox="0 0 24 24" aria-hidden className="size-4.5">
              <path d={p.path} fill="currentColor" />
            </svg>
            {p.label}
          </button>
        ))}
      </form>

      <div className="my-7 flex items-center gap-4">
        <span className="h-px flex-1 bg-edge" />
        <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-faint">
          or
        </span>
        <span className="h-px flex-1 bg-edge" />
      </div>
    </>
  );
}
