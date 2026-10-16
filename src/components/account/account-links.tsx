/** Links shared by the header's account menu and the account sidebar. */

export type AccountLink = { label: string; href: string; icon: string[] };

export const ACCOUNT_GROUPS: { title: string; links: AccountLink[] }[] = [
  {
    title: "Learning",
    links: [
      {
        label: "My Courses",
        href: "/account/courses",
        icon: ["M3 6.5A2.5 2.5 0 015.5 4h13A2.5 2.5 0 0121 6.5v11a2.5 2.5 0 01-2.5 2.5h-13A2.5 2.5 0 013 17.5v-11z", "M10 9l5 3-5 3V9z"],
      },
      {
        label: "My Books",
        href: "/account/books",
        icon: ["M12 6.5C10.5 5 8 4.5 4 4.5v14c4 0 6.5.5 8 2 1.5-1.5 4-2 8-2v-14c-4 0-6.5.5-8 2z", "M12 6.5v14"],
      },
      {
        label: "Wishlist",
        href: "/account/wishlist",
        icon: ["M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0112 7a4.3 4.3 0 017.5 2.8C19.5 15.4 12 20 12 20z"],
      },
    ],
  },
  {
    title: "Account",
    links: [
      {
        label: "Profile",
        href: "/account/profile",
        icon: ["M12 12a4 4 0 100-8 4 4 0 000 8z", "M4.5 20.5a7.5 7.5 0 0115 0"],
      },
      {
        label: "Account settings",
        href: "/account/settings",
        icon: ["M4 7h9M17 7h3M4 17h3M11 17h9", "M15 5a2 2 0 110 4 2 2 0 010-4zM9 15a2 2 0 110 4 2 2 0 010-4z"],
      },
      {
        label: "Purchases & billing",
        href: "/account/billing",
        icon: ["M3 7.5A2.5 2.5 0 015.5 5h13A2.5 2.5 0 0121 7.5v9a2.5 2.5 0 01-2.5 2.5h-13A2.5 2.5 0 013 16.5v-9z", "M3 10h18M7 15h3"],
      },
    ],
  },
  {
    title: "Support",
    links: [
      {
        label: "Help & support",
        href: "/account/help",
        icon: ["M12 21a9 9 0 100-18 9 9 0 000 18z", "M9.6 9.4a2.5 2.5 0 014.8 1c0 1.7-2.4 2-2.4 3.6M12 17h.01"],
      },
    ],
  },
];

export function iconFor(href: string) {
  return ACCOUNT_GROUPS.flatMap((g) => g.links).find((l) => l.href === href)?.icon ?? [];
}

export const SIGN_OUT_ICON =["M9 20H6.5A2.5 2.5 0 014 17.5v-11A2.5 2.5 0 016.5 4H9", "M15 8l4 4-4 4M19 12H9"];

export function AccountIcon({ paths, className = "size-[18px]" }: { paths: string[]; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={`shrink-0 ${className}`}>
      {paths.map((d) => (
        <path key={d} d={d} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      ))}
    </svg>
  );
}
