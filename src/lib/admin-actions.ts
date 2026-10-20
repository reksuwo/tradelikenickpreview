"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/admin";
import { getOrder } from "@/lib/admin-data";
import { BOOKS } from "@/lib/books";
import { getCourse } from "@/lib/course-store";
import { db } from "@/lib/db";
import { getLectureRecord } from "@/lib/lecture-store";
import { announce, notify, type NotificationKind } from "@/lib/notifications";
import { markRefunded } from "@/lib/purchases";
import { abortMultipartUpload, completeMultipartUpload, deleteObject, objectExists, startMultipartUpload } from "@/lib/r2";
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
  const item = type === "course" ? await getCourse(id) : type === "book" ? BOOKS.find((b) => b.id === id) : null;
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
  if (!(await getCourse(courseId))) return { error: "That course doesn't exist." };
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
  const videoKey = field(formData, "videoKey").replace(/^\/+/, "") || null;

  if (title.length < 2) return { error: "Give the lecture a title." };
  if (seconds === null) return { error: "Write the length as minutes:seconds, like 12:34." };
  if (videoKey && (!VIDEO_KEY.test(videoKey) || videoKey.includes(".."))) {
    return { error: "The video path should look like Lectures/lecture-06.mp4: a folder and file name in the bucket, ending in .mp4, .webm or .mov." };
  }
  if (published && !videoKey) return { error: "Add the video's file path before publishing." };
  // Check a new path actually points at a file, so members never get a broken player.
  if (videoKey && videoKey !== lecture.videoKey) {
    try {
      if (!(await objectExists(videoKey))) return { error: `There's no file at ${videoKey} in the bucket. Check the path, or upload it first.` };
    } catch (error) {
      console.error("admin: video check failed", error);
      return { error: "Couldn't reach R2 to check the video. Try again in a moment." };
    }
  }

  try {
    await db`
      update public.lectures set ${db({ title, description, seconds, free, published, video_key: videoKey })}, updated_at = now()
      where id = ${lecture.id}
    `;
    if (published && !lecture.published && notifyMembers) {
      const course = await getCourse(lecture.courseId);
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

/** Videos are managed in the bucket directly; R2 holds only the image files the panel uploaded under Thumbnails/. */
const VIDEO_KEY = /^[\w-]+(\/[\w.-]+)+\.(mp4|m4v|webm|mov)$/i;

function ownedKey(key: string | null) {
  return Boolean(key?.startsWith("Thumbnails/"));
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
  // The video file stays in the bucket; only the thumbnail the panel uploaded goes.
  if (ownedKey(lecture.thumbnail)) {
    await deleteObject(lecture.thumbnail!).catch((e) => console.error("admin: delete object failed", e));
  }
  revalidateCourse(lecture.courseId);
  redirect(`/admin/courses/${lecture.courseId}`);
}

// ─── Thumbnail uploads ───────────────────────────────────────────────

const IMAGE_TYPES: Record<string, string> = { "image/webp": "webp", "image/jpeg": "jpg", "image/png": "png" };
const MAX_IMAGE_BYTES = 10 * 1024 ** 2;

/** Only thumbnails upload from the panel; videos are put in the bucket by hand. */
export type UploadKind = "thumbnail";

export type UploadTicket = { key: string; uploadId: string; partUrls: string[] } | { error: string };

/** Opens an upload for a lecture's thumbnail. The browser then PUTs the image to the URL. */
export async function startUpload(input: {
  lectureId: string;
  kind: UploadKind;
  contentType: string;
  size: number;
}): Promise<UploadTicket> {
  if (!(await getAdmin())) return DENIED as { error: string };
  if (input.kind !== "thumbnail") return { error: "Only thumbnails can be uploaded here." };
  const lecture = await getLectureRecord(input.lectureId);
  if (!lecture) return { error: "That lecture doesn't exist." };

  const ext = IMAGE_TYPES[input.contentType];
  if (!ext) return { error: "Upload a WebP, JPEG or PNG image." };
  if (!(input.size > 0) || input.size > MAX_IMAGE_BYTES) return { error: "Images can be up to 10 MB." };

  const key = `Thumbnails/${lecture.id}-${randomBytes(4).toString("hex")}.${ext}`;
  try {
    // One part: anything under 5 GB fits, and images are capped at 10 MB.
    const { uploadId, partUrls } = await startMultipartUpload(key, input.contentType, 1);
    return { key, uploadId, partUrls };
  } catch (error) {
    console.error("admin: start upload failed", error);
    return { error: "Couldn't start the upload. Check the R2 keys have write access." };
  }
}

/** Finishes a thumbnail upload and points the lecture at it, replacing the old one. */
export async function finishUpload(input: {
  lectureId: string;
  kind: UploadKind;
  key: string;
  uploadId: string;
  parts: { partNumber: number; etag: string }[];
}): Promise<ActionState> {
  if (!(await getAdmin())) return DENIED;
  const lecture = await getLectureRecord(input.lectureId);
  if (!lecture) return { error: "That lecture doesn't exist." };

  // Only accept keys startUpload could have made for this lecture.
  if (!input.key.startsWith(`Thumbnails/${lecture.id}-`) || input.key.includes("..")) {
    return { error: "That upload doesn't belong to this lecture." };
  }

  try {
    await completeMultipartUpload(input.key, input.uploadId, input.parts);
    await db`update public.lectures set thumbnail = ${input.key}, updated_at = now() where id = ${lecture.id}`;
  } catch (error) {
    return failed("finish the upload", error);
  }

  if (lecture.thumbnail !== input.key && ownedKey(lecture.thumbnail)) {
    await deleteObject(lecture.thumbnail!).catch((e) => console.error("admin: delete old object failed", e));
  }

  revalidateCourse(lecture.courseId);
  revalidatePath(`/admin/courses/${lecture.courseId}/lectures/${lecture.id}`);
  return { message: "Thumbnail updated." };
}

export async function cancelUpload(input: { key: string; uploadId: string }) {
  if (!(await getAdmin())) return;
  if (!input.key.startsWith("Thumbnails/")) return;
  await abortMultipartUpload(input.key, input.uploadId).catch((e) => console.error("admin: abort upload failed", e));
}

// ─── Courses ──────────────────────────────────────────────────────────

/** Courses appear on nearly every page, marketing ones included, so a change refreshes them all. */
function revalidateCatalogue() {
  revalidatePath("/", "layout");
}

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;

function slugify(title: string) {
  return title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/, "");
}

/** "697", "$24.50" → cents. Null when it isn't a price. */
function parsePrice(value: string) {
  const match = /^\$?\s*(\d{1,6})(?:\.(\d{1,2}))?$/.exec(value.replace(/,/g, ""));
  return match ? Number(match[1]) * 100 + Number((match[2] ?? "0").padEnd(2, "0")) : null;
}

/** The editable fields of the course form, checked. */
function readCourse(formData: FormData) {
  const title = field(formData, "title");
  const category = field(formData, "category");
  const level = field(formData, "level") || "All levels";
  const hours = field(formData, "hours");
  const lessons = field(formData, "lessons");
  const blurb = field(formData, "blurb");
  const badge = field(formData, "badge");
  const rating = field(formData, "rating");
  const poster = Number(field(formData, "poster"));
  const included = formData.get("included") === "on";
  const priceCents = included ? null : parsePrice(field(formData, "price"));
  const published = formData.get("published") === "on";

  if (title.length < 2 || title.length > 120) return { error: "Give the course a title of 2 to 120 characters." };
  if (!category || category.length > 40) return { error: "Give it a category, like Foundations or Risk." };
  if (blurb.length > 600) return { error: "Keep the description under 600 characters." };
  if (badge.length > 30) return { error: "Keep the badge short, under 30 characters." };
  if (rating && !/^[0-5](\.\d)?$/.test(rating)) return { error: "Write the rating like 4.8, or leave it empty." };
  if (!Number.isInteger(poster) || poster < 0 || poster > 8) return { error: "Pick a poster." };
  if (!included && (priceCents === null || priceCents < 50)) {
    return { error: "Enter a price of at least $0.50, like 149 or 24.50, or tick Included." };
  }

  return {
    values: {
      title,
      category,
      level,
      hours,
      lessons,
      blurb,
      badge: badge || null,
      rating,
      poster,
      price_cents: priceCents,
      published,
    },
  };
}

export async function createCourse(_prev: ActionState, formData: FormData): Promise<ActionState> {
  if (!(await getAdmin())) return DENIED;
  const course = readCourse(formData);
  if ("error" in course) return { error: course.error };

  const id = field(formData, "id") || slugify(course.values.title);
  if (id === "new") return { error: "That web address is reserved. Choose another." };
  if (!SLUG.test(id) || id.length > 60) {
    return { error: "The web address can only use lowercase letters, numbers and single dashes, like position-sizing." };
  }

  try {
    if (await getCourse(id)) return { error: `A course already uses the address ${id}. Choose another.` };
    const [{ next }] = await db<{ next: number }[]>`select coalesce(max(position), 0)::int + 1 as next from public.courses`;
    await db`insert into public.courses ${db({ id, ...course.values, position: next })}`;
  } catch (error) {
    return failed("create the course", error);
  }
  revalidateCatalogue();
  redirect(`/admin/courses/${id}`);
}

export async function updateCourse(_prev: ActionState, formData: FormData): Promise<ActionState> {
  if (!(await getAdmin())) return DENIED;
  const existing = await getCourse(field(formData, "id"));
  if (!existing) return { error: "That course doesn't exist." };
  const course = readCourse(formData);
  if ("error" in course) return { error: course.error };

  try {
    await db`update public.courses set ${db(course.values)}, updated_at = now() where id = ${existing.id}`;
  } catch (error) {
    return failed("save the course", error);
  }
  revalidateCatalogue();
  const priceChanged = (course.values.price_cents ?? null) !== existing.priceCents;
  return { message: priceChanged ? "Saved. New checkouts use the new price." : "Saved." };
}

/** Keeps course positions 1, 2, 3… in their current order. */
async function renumberCourses() {
  await db`
    update public.courses c set position = r.n
    from (select id, row_number() over (order by position, created_at) as n from public.courses) r
    where c.id = r.id and c.position <> r.n
  `;
}

export async function moveCourse(_prev: ActionState, formData: FormData): Promise<ActionState> {
  if (!(await getAdmin())) return DENIED;
  const id = field(formData, "id");
  const up = field(formData, "direction") === "up";

  try {
    await renumberCourses();
    const [self] = await db<{ position: number }[]>`select position from public.courses where id = ${id}`;
    if (!self) return { error: "That course doesn't exist." };
    const [other] = await db<{ id: string; position: number }[]>`
      select id, position from public.courses where position = ${self.position + (up ? -1 : 1)}
    `;
    if (other) {
      await db.begin((tx) => [
        tx`update public.courses set position = ${other.position} where id = ${id}`,
        tx`update public.courses set position = ${self.position} where id = ${other.id}`,
      ]);
    }
  } catch (error) {
    return failed("move the course", error);
  }
  revalidateCatalogue();
  return undefined;
}

/**
 * Deletes a course nobody has bought and that has no lectures. Anything with
 * history is hidden instead, so owners keep what they paid for.
 */
export async function deleteCourse(_prev: ActionState, formData: FormData): Promise<ActionState> {
  if (!(await getAdmin())) return DENIED;
  const course = await getCourse(field(formData, "id"));
  if (!course) return { error: "That course doesn't exist." };

  try {
    const [{ orders, lectures }] = await db<{ orders: number; lectures: number }[]>`
      select (select count(*)::int from public.purchases where product_type = 'course' and product_id = ${course.id}) as orders,
             (select count(*)::int from public.lectures where course_id = ${course.id}) as lectures
    `;
    if (orders) return { error: "Members have bought this course, so it can't be deleted. Hide it instead." };
    if (lectures) return { error: "Delete this course's lectures first, or hide the course instead." };
    await db`delete from public.courses where id = ${course.id}`;
    await renumberCourses();
  } catch (error) {
    return failed("delete the course", error);
  }
  revalidateCatalogue();
  redirect("/admin/courses");
}
