"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/admin";
import { getOrder } from "@/lib/admin-data";
import { BOOKS } from "@/lib/books";
import { COURSES } from "@/lib/courses";
import { db } from "@/lib/db";
import { getLectureRecord } from "@/lib/lecture-store";
import { announce, notify, type NotificationKind } from "@/lib/notifications";
import { markRefunded } from "@/lib/purchases";
import { abortMultipartUpload, completeMultipartUpload, deleteObject, startMultipartUpload } from "@/lib/r2";
import { stripe } from "@/lib/stripe";

/**
 * Everything the admin panel changes. Server Actions can be called by anyone
 * with a POST, so each one checks for an admin first.
 */

export type ActionState = { error?: string; message?: string } | undefined;

const DENIED = { error: "You don't have access to do that." };

function field(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function failed(what: string, error: unknown): ActionState {
  console.error(`admin: ${what} failed`, error);
  return { error: `Couldn't ${what}. Try again in a moment.` };
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// ─── Access & refunds ─────────────────────────────────────────────────

/** Gives a member a course or book without payment. `product` is "course:<id>" or "book:<id>". */
export async function grantAccess(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await getAdmin();
  if (!admin) return DENIED;

  const userId = field(formData, "userId");
  const [type, id] = field(formData, "product").split(":");
  const item = type === "course" ? COURSES.find((c) => c.id === id) : type === "book" ? BOOKS.find((b) => b.id === id) : null;
  if (!UUID.test(userId) || !item) return { error: "Pick a course or book to give." };

  try {
    const owned = await db`
      select 1 from public.purchases
      where user_id = ${userId} and product_type = ${type} and product_id = ${id} and refunded_at is null
    `;
    if (owned.length) return { error: `They already have ${item.title}.` };

    await db`
      insert into public.purchases ${db({
        user_id: userId,
        product_type: type,
        product_id: id,
        title: item.title,
        amount_cents: 0,
        currency: "usd",
        source: "grant",
        granted_by: admin.id,
      })}
    `;
    await notify(userId, {
      kind: "purchase",
      title: `${item.title} has been added to your library`,
      body: type === "course" ? "Start watching whenever you're ready." : "Your download is ready in My Books.",
      href: type === "course" ? `/browse/watch/${id}` : "/account/books",
    });
  } catch (error) {
    return failed("give access", error);
  }

  revalidatePath(`/admin/members/${userId}`);
  return { message: `${item.title} added to their library.` };
}

/** Takes back something an admin gave. Paid orders are refunded instead. */
export async function revokeGrant(_prev: ActionState, formData: FormData): Promise<ActionState> {
  if (!(await getAdmin())) return DENIED;
  const id = field(formData, "purchaseId");
  if (!UUID.test(id)) return { error: "That order doesn't exist." };

  try {
    const removed = await db`delete from public.purchases where id = ${id} and source = 'grant' returning user_id`;
    if (!removed.length) return { error: "Only access you gave by hand can be removed." };
    revalidatePath(`/admin/members/${removed[0].user_id}`);
  } catch (error) {
    return failed("remove access", error);
  }
  revalidatePath("/admin/orders");
  return { message: "Access removed." };
}

/** Refunds a paid order in full through Stripe and takes the item away. */
export async function refundOrder(_prev: ActionState, formData: FormData): Promise<ActionState> {
  if (!(await getAdmin())) return DENIED;
  const id = field(formData, "purchaseId");
  if (!UUID.test(id)) return { error: "That order doesn't exist." };

  const order = await getOrder(id);
  if (!order || order.source !== "stripe") return { error: "Only paid orders can be refunded." };
  if (order.refundedAt) return { error: "This order is already refunded." };
  if (!order.paymentIntent) return { error: "This order has no Stripe payment to refund. Refund it in the Stripe dashboard." };

  try {
    await stripe().refunds.create({ payment_intent: order.paymentIntent, reason: "requested_by_customer" });
    await markRefunded(order.paymentIntent);
  } catch (error) {
    const message = (error as { raw?: { message?: string } }).raw?.message;
    console.error("admin: refund failed", error);
    return { error: message ? `Stripe: ${message}` : "Stripe couldn't refund this order. Try again in a moment." };
  }

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/members/${order.userId}`);
  return { message: `Refunded ${order.title}. Their access has been removed.` };
}

// ─── Notifications ────────────────────────────────────────────────────

const SENDABLE: NotificationKind[] = ["announcement", "course", "live"];

/** A link inside the site, or an https link elsewhere. */
function safeHref(href: string) {
  if (!href) return "";
  if (href.startsWith("/") && !href.startsWith("//")) return href;
  try {
    return new URL(href).protocol === "https:" ? href : null;
  } catch {
    return null;
  }
}

export async function sendNotification(_prev: ActionState, formData: FormData): Promise<ActionState> {
  if (!(await getAdmin())) return DENIED;

  const kind = field(formData, "kind") as NotificationKind;
  const title = field(formData, "title");
  const body = field(formData, "body");
  const href = safeHref(field(formData, "href"));
  const to = field(formData, "to").toLowerCase();

  if (!SENDABLE.includes(kind)) return { error: "Pick a type." };
  if (title.length < 3 || title.length > 120) return { error: "Give it a title of 3 to 120 characters." };
  if (body.length > 500) return { error: "Keep the message under 500 characters." };
  if (href === null) return { error: "Links must start with / or https://." };

  try {
    const input = { kind, title, body: body || undefined, href: href || undefined };
    if (to) {
      const [user] = await db<{ id: string }[]>`select id from auth.users where lower(email) = ${to}`;
      if (!user) return { error: `No member has the email ${to}.` };
      await notify(user.id, input);
    } else {
      await announce(input);
    }
  } catch (error) {
    return failed("send the notification", error);
  }

  revalidatePath("/admin/notifications");
  return { message: to ? `Sent to ${to}.` : "Sent to every member." };
}

export async function deleteNotification(_prev: ActionState, formData: FormData): Promise<ActionState> {
  if (!(await getAdmin())) return DENIED;
  const id = field(formData, "id");
  if (!UUID.test(id)) return { error: "That notification doesn't exist." };
  try {
    await db`delete from public.notifications where id = ${id} and kind <> 'purchase'`;
  } catch (error) {
    return failed("delete the notification", error);
  }
  revalidatePath("/admin/notifications");
  return { message: "Deleted." };
}

// ─── Lectures ─────────────────────────────────────────────────────────

/** Keeps positions 1, 2, 3… with no gaps or ties, in their current order. */
async function renumber(courseId: string) {
  await db`
    update public.lectures l set position = r.n
    from (select id, row_number() over (order by position, created_at) as n from public.lectures where course_id = ${courseId}) r
    where l.id = r.id and l.position <> r.n
  `;
}

function revalidateCourse(courseId: string) {
  revalidatePath(`/admin/courses/${courseId}`);
  revalidatePath(`/browse/watch/${courseId}`);
  revalidatePath("/browse");
}

/** Adds a draft lecture at the end of a course and opens it for editing. */
export async function createLecture(_prev: ActionState, formData: FormData): Promise<ActionState> {
  if (!(await getAdmin())) return DENIED;
  const courseId = field(formData, "courseId");
  const title = field(formData, "title");
  if (!COURSES.some((c) => c.id === courseId)) return { error: "That course doesn't exist." };
  if (title.length < 2) return { error: "Give the lecture a title." };

  let id: string;
  try {
    const [row] = await db<{ id: string }[]>`
      insert into public.lectures (course_id, position, title)
      values (${courseId}, (select coalesce(max(position), 0) + 1 from public.lectures where course_id = ${courseId}), ${title})
      returning id
    `;
    id = row.id;
  } catch (error) {
    return failed("add the lecture", error);
  }
  revalidateCourse(courseId);
  redirect(`/admin/courses/${courseId}/lectures/${id}`);
}

/** "12:34", "1:02:03" or plain seconds → seconds. */
function parseDuration(value: string) {
  if (!value) return 0;
  const parts = value.split(":").map(Number);
  if (parts.some((n) => !Number.isFinite(n) || n < 0)) return null;
  return Math.round(parts.reduce((total, n) => total * 60 + n, 0));
}

export async function updateLecture(_prev: ActionState, formData: FormData): Promise<ActionState> {
  if (!(await getAdmin())) return DENIED;
  const lecture = await getLectureRecord(field(formData, "id"));
  if (!lecture) return { error: "That lecture doesn't exist." };

  const title = field(formData, "title");
  const description = field(formData, "description");
  const seconds = parseDuration(field(formData, "duration"));
  const free = formData.get("free") === "on";
  const published = formData.get("published") === "on";
  const notifyMembers = formData.get("notify") === "on";

  if (title.length < 2) return { error: "Give the lecture a title." };
  if (seconds === null) return { error: "Write the length as minutes:seconds, like 12:34." };
  if (published && !lecture.videoKey) return { error: "Upload a video before publishing." };

  try {
    await db`
      update public.lectures set ${db({ title, description, seconds, free, published })}, updated_at = now()
      where id = ${lecture.id}
    `;
    if (published && !lecture.published && notifyMembers) {
      const course = COURSES.find((c) => c.id === lecture.courseId);
      await announce({
        kind: "course",
        title: `New lecture: ${title}`,
        body: course ? `Now in ${course.title}.` : undefined,
        href: `/browse/watch/${lecture.courseId}?lecture=${lecture.position}`,
      });
    }
  } catch (error) {
    return failed("save the lecture", error);
  }

  revalidateCourse(lecture.courseId);
  revalidatePath(`/admin/courses/${lecture.courseId}/lectures/${lecture.id}`);
  return { message: published && !lecture.published ? "Saved and published." : "Saved." };
}

export async function moveLecture(_prev: ActionState, formData: FormData): Promise<ActionState> {
  if (!(await getAdmin())) return DENIED;
  const lecture = await getLectureRecord(field(formData, "id"));
  if (!lecture) return { error: "That lecture doesn't exist." };
  const up = field(formData, "direction") === "up";

  try {
    await renumber(lecture.courseId);
    const [self] = await db<{ position: number }[]>`select position from public.lectures where id = ${lecture.id}`;
    const [other] = await db<{ id: string; position: number }[]>`
      select id, position from public.lectures
      where course_id = ${lecture.courseId} and position = ${self.position + (up ? -1 : 1)}
    `;
    if (other) {
      await db.begin((tx) => [
        tx`update public.lectures set position = ${other.position} where id = ${lecture.id}`,
        tx`update public.lectures set position = ${self.position} where id = ${other.id}`,
      ]);
    }
  } catch (error) {
    return failed("move the lecture", error);
  }
  revalidateCourse(lecture.courseId);
  return undefined;
}

/** Files we uploaded ourselves. The original videos aren't deleted from the panel. */
function ownedKey(key: string | null, courseId: string) {
  return Boolean(key && (key.startsWith(`Lectures/${courseId}/`) || key.startsWith("Thumbnails/")));
}

export async function deleteLecture(_prev: ActionState, formData: FormData): Promise<ActionState> {
  if (!(await getAdmin())) return DENIED;
  const lecture = await getLectureRecord(field(formData, "id"));
  if (!lecture) return { error: "That lecture doesn't exist." };

  try {
    await db`delete from public.lectures where id = ${lecture.id}`;
    await renumber(lecture.courseId);
  } catch (error) {
    return failed("delete the lecture", error);
  }
  for (const key of [lecture.videoKey, lecture.thumbnail]) {
    if (ownedKey(key, lecture.courseId)) await deleteObject(key!).catch((e) => console.error("admin: delete object failed", e));
  }
  revalidateCourse(lecture.courseId);
  redirect(`/admin/courses/${lecture.courseId}`);
}

// ─── Uploads ──────────────────────────────────────────────────────────

const KINDS = {
  video: { types: { "video/mp4": "mp4", "video/webm": "webm", "video/quicktime": "mov" }, maxBytes: 20 * 1024 ** 3 },
  thumbnail: { types: { "image/webp": "webp", "image/jpeg": "jpg", "image/png": "png" }, maxBytes: 10 * 1024 ** 2 },
} as const;

export type UploadKind = keyof typeof KINDS;

/** Parts of at least 16 MB, and no more than R2's 10,000. */
const MIN_PART = 16 * 1024 ** 2;

export type UploadTicket =
  | { key: string; uploadId: string; partSize: number; partUrls: string[] }
  | { error: string };

/** Opens an upload for a lecture's video or thumbnail. The browser then PUTs each part to its URL. */
export async function startUpload(input: {
  lectureId: string;
  kind: UploadKind;
  contentType: string;
  size: number;
}): Promise<UploadTicket> {
  if (!(await getAdmin())) return DENIED as { error: string };
  const lecture = await getLectureRecord(input.lectureId);
  const kind = KINDS[input.kind];
  if (!lecture || !kind) return { error: "That lecture doesn't exist." };

  const ext = (kind.types as Record<string, string>)[input.contentType];
  if (!ext) {
    return { error: input.kind === "video" ? "Upload an MP4, WebM or MOV video." : "Upload a WebP, JPEG or PNG image." };
  }
  if (!(input.size > 0) || input.size > kind.maxBytes) return { error: "That file is too large." };

  const name = `${lecture.id}-${randomBytes(4).toString("hex")}.${ext}`;
  const key = input.kind === "video" ? `Lectures/${lecture.courseId}/${name}` : `Thumbnails/${name}`;
  const partSize = Math.max(MIN_PART, Math.ceil(input.size / 10_000));

  try {
    const { uploadId, partUrls } = await startMultipartUpload(key, input.contentType, Math.ceil(input.size / partSize));
    return { key, uploadId, partSize, partUrls };
  } catch (error) {
    console.error("admin: start upload failed", error);
    return { error: "Couldn't start the upload. Check the R2 keys have write access." };
  }
}

/** Finishes an upload and points the lecture at the new file, replacing the old one. */
export async function finishUpload(input: {
  lectureId: string;
  kind: UploadKind;
  key: string;
  uploadId: string;
  parts: { partNumber: number; etag: string }[];
  /** The video's running time, read in the browser. */
  seconds?: number;
}): Promise<ActionState> {
  if (!(await getAdmin())) return DENIED;
  const lecture = await getLectureRecord(input.lectureId);
  if (!lecture) return { error: "That lecture doesn't exist." };

  // Only accept keys startUpload could have made for this lecture.
  const prefix = input.kind === "video" ? `Lectures/${lecture.courseId}/${lecture.id}-` : `Thumbnails/${lecture.id}-`;
  if (!input.key.startsWith(prefix) || input.key.includes("..")) return { error: "That upload doesn't belong to this lecture." };

  try {
    await completeMultipartUpload(input.key, input.uploadId, input.parts);
    if (input.kind === "video") {
      const seconds = Math.round(Number(input.seconds) || 0);
      await db`
        update public.lectures
        set video_key = ${input.key}, seconds = ${seconds > 0 ? seconds : lecture.seconds}, updated_at = now()
        where id = ${lecture.id}
      `;
    } else {
      await db`update public.lectures set thumbnail = ${input.key}, updated_at = now() where id = ${lecture.id}`;
    }
  } catch (error) {
    return failed("finish the upload", error);
  }

  const old = input.kind === "video" ? lecture.videoKey : lecture.thumbnail;
  if (old !== input.key && ownedKey(old, lecture.courseId)) {
    await deleteObject(old!).catch((e) => console.error("admin: delete old object failed", e));
  }

  revalidateCourse(lecture.courseId);
  revalidatePath(`/admin/courses/${lecture.courseId}/lectures/${lecture.id}`);
  return { message: input.kind === "video" ? "Video uploaded." : "Thumbnail updated." };
}

export async function cancelUpload(input: { key: string; uploadId: string }) {
  if (!(await getAdmin())) return;
  if (!/^(Lectures|Thumbnails)\//.test(input.key)) return;
  await abortMultipartUpload(input.key, input.uploadId).catch((e) => console.error("admin: abort upload failed", e));
}
