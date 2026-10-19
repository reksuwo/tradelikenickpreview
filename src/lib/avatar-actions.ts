"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import type { AuthState } from "@/lib/auth-actions";
import { deleteObject, putObject } from "@/lib/r2";
import { createClient } from "@/lib/supabase/server";

/** The browser shrinks photos to 256px before sending, so anything near this is not one of ours. */
const MAX_BYTES = 1024 * 1024;
const TYPES: Record<string, string> = { "image/webp": "webp", "image/jpeg": "jpg", "image/png": "png" };

/** Deletes an earlier upload, but only one that belongs to this member. */
async function removeOld(userId: string, file: unknown) {
  if (typeof file !== "string" || !file.startsWith(`${userId}-`)) return;
  await deleteObject(`Avatars/${file}`).catch((error) => console.error("Deleting old profile photo failed", error));
}

export async function uploadAvatar(formData: FormData): Promise<AuthState> {
  const photo = formData.get("photo");
  if (!(photo instanceof File) || photo.size === 0) return { error: "Choose a photo." };
  const ext = TYPES[photo.type];
  if (!ext) return { error: "Use a JPG, PNG or WebP image." };
  if (photo.size > MAX_BYTES) return { error: "That photo is too large." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sign in again to change your photo." };

  // A new name every time, so the served file can be cached forever.
  const file = `${user.id}-${randomBytes(6).toString("hex")}.${ext}`;
  try {
    await putObject(`Avatars/${file}`, new Uint8Array(await photo.arrayBuffer()), photo.type);
  } catch (error) {
    console.error("Uploading profile photo failed", error);
    return { error: "We couldn't save your photo. Try again in a moment." };
  }

  const { error } = await supabase.auth.updateUser({ data: { photo: file } });
  if (error) {
    await deleteObject(`Avatars/${file}`).catch(() => {});
    return { error: "We couldn't save your photo. Try again in a moment." };
  }
  await removeOld(user.id, user.user_metadata?.photo);

  // The photo shows in the header on every member page.
  revalidatePath("/", "layout");
  return { message: "Photo updated." };
}

export async function removeAvatar(): Promise<AuthState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sign in again to change your photo." };

  const { error } = await supabase.auth.updateUser({ data: { photo: null } });
  if (error) return { error: "We couldn't remove your photo. Try again in a moment." };
  await removeOld(user.id, user.user_metadata?.photo);

  revalidatePath("/", "layout");
  return { message: "Photo removed." };
}
