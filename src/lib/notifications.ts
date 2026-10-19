import "server-only";
import { cache } from "react";
import { db } from "./db";
import { getUser } from "./supabase/server";

export type NotificationKind = "purchase" | "course" | "live" | "announcement";

/** Plain values only, so the header (a client component) can receive them. */
export type Notification = {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string | null;
  href: string | null;
  /** ISO timestamp */
  createdAt: string;
  unread: boolean;
};

export type NotificationInput = {
  kind: NotificationKind;
  title: string;
  body?: string;
  href?: string;
};

/** How many the bell lists. Older ones drop off. */
const LIMIT = 20;

/** Sends a notification to one member. */
export async function notify(userId: string, { kind, title, body, href }: NotificationInput) {
  await db`
    insert into public.notifications ${db({ user_id: userId, kind, title, body: body ?? null, href: href ?? null })}
  `;
}

/** Sends a notification to every member, including those who join later. */
export async function announce({ kind, title, body, href }: NotificationInput) {
  await db`
    insert into public.notifications ${db({ user_id: null, kind, title, body: body ?? null, href: href ?? null })}
  `;
}

/**
 * A member's latest notifications, newest first. Announcements from before
 * they joined are left out so a new account doesn't start with old news.
 */
export async function listNotifications(userId: string): Promise<Notification[]> {
  const rows = await db<(Omit<Notification, "createdAt"> & { createdAt: Date })[]>`
    select n.id, n.kind, n.title, n.body, n.href, n.created_at as "createdAt",
           n.created_at > coalesce(r.seen_at, '-infinity') as unread
    from public.notifications n
    join auth.users u on u.id = ${userId}
    left join public.notification_reads r on r.user_id = ${userId}
    where n.user_id = ${userId} or (n.user_id is null and n.created_at >= u.created_at)
    order by n.created_at desc
    limit ${LIMIT}
  `;
  return rows.map((row) => ({ ...row, createdAt: row.createdAt.toISOString() }));
}

/** The signed-in member's notifications for the header. Empty if signed out or the database is down. */
export const getNotifications = cache(async (): Promise<Notification[]> => {
  const user = await getUser();
  if (!user) return [];
  try {
    return await listNotifications(user.id);
  } catch (error) {
    // Keep the pages up if the database is unreachable; the bell fills in once it's back.
    console.error("getNotifications failed", error);
    return [];
  }
});

/** Marks everything up to now as seen. */
export async function markNotificationsSeen(userId: string) {
  await db`
    insert into public.notification_reads (user_id, seen_at) values (${userId}, now())
    on conflict (user_id) do update set seen_at = excluded.seen_at
  `;
}
