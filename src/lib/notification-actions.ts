"use server";

import { listNotifications, markNotificationsSeen, type Notification } from "@/lib/notifications";
import { getUser } from "@/lib/supabase/server";

/**
 * Called when a member opens the bell: returns a fresh list (the header's copy
 * can be stale, since layouts don't re-render on navigation) and clears the badge.
 */
export async function openNotifications(): Promise<Notification[]> {
  const user = await getUser();
  if (!user) return [];

  const list = await listNotifications(user.id);
  await markNotificationsSeen(user.id);
  return list;
}
