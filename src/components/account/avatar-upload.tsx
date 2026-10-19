"use client";

import { useRef, useState, useTransition } from "react";
import { Avatar } from "@/components/account/avatar";
import type { AuthState } from "@/lib/auth-actions";
import { removeAvatar, uploadAvatar } from "@/lib/avatar-actions";

const SIZE = 256;

/** Crops the middle square of a photo and shrinks it to 256px, so uploads stay a few KB. */
async function squarePhoto(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const side = Math.min(bitmap.width, bitmap.height);
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no canvas");
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, SIZE, SIZE);
  bitmap.close();

  const encode = (type: string) => new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, 0.88));
  // Older Safari can't write WebP and hands back a PNG instead; JPEG is smaller.
  const webp = await encode("image/webp");
  const blob = webp?.type === "image/webp" ? webp : await encode("image/jpeg");
  if (!blob) throw new Error("encode failed");
  return blob;
}

/** The profile card: photo (click to change), name and email, and upload/remove buttons. */
export function ProfileCard({
  name,
  email,
  joined,
  src,
  uploaded,
}: {
  name: string;
  email: string;
  joined: string;
  src?: string;
  /** The current photo is one the member uploaded, so it can be removed. */
  uploaded: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string>();
  const [state, setState] = useState<AuthState>();
  const [pending, startTransition] = useTransition();

  function choose(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setState({ error: "Choose an image file." });
      return;
    }

    startTransition(async () => {
      let photo: Blob;
      try {
        photo = await squarePhoto(file);
      } catch {
        setState({ error: "We couldn't read that image. Try a JPG or PNG." });
        return;
      }
      const url = URL.createObjectURL(photo);
      setPreview(url);
      const formData = new FormData();
      formData.append("photo", photo, `photo.${photo.type === "image/webp" ? "webp" : "jpg"}`);
      try {
        setState(await uploadAvatar(formData));
      } catch {
        setState({ error: "We couldn't save your photo. Try again in a moment." });
      }
      setPreview(undefined);
      URL.revokeObjectURL(url);
    });
  }

  function remove() {
    startTransition(async () => {
      try {
        setState(await removeAvatar());
      } catch {
        setState({ error: "We couldn't remove your photo. Try again in a moment." });
      }
    });
  }

  const pick = () => input.current?.click();

  return (
    <section className="flex items-center gap-5 rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-7">
      <button
        type="button"
        onClick={pick}
        disabled={pending}
        aria-label="Change profile photo"
        className="group relative shrink-0 rounded-2xl outline-none focus-visible:ring-4 focus-visible:ring-white/25 disabled:cursor-wait"
      >
        <Avatar name={name} src={preview ?? src} className="size-16 rounded-2xl text-[22px] sm:size-20 sm:text-[26px]" />
        <span
          className={`absolute inset-0 grid place-items-center rounded-2xl bg-black/55 text-white transition-opacity ${
            pending ? "opacity-100" : "opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100"
          }`}
        >
          {pending ? (
            <span className="size-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          ) : (
            <svg viewBox="0 0 24 24" aria-hidden className="size-6">
              <path
                d="M4 8.5A2.5 2.5 0 0 1 6.5 6h1.3l1.4-2h5.6l1.4 2h1.3A2.5 2.5 0 0 1 20 8.5v8a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 16.5z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinejoin="round"
              />
              <circle cx="12" cy="12.5" r="3.3" fill="none" stroke="currentColor" strokeWidth="1.7" />
            </svg>
          )}
        </span>
      </button>
      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" onChange={choose} hidden />

      <div className="min-w-0">
        <p className="truncate text-[20px] font-extrabold text-white">{name}</p>
        <p className="truncate text-[14px] text-white/55">{email}</p>
        <p className="mt-1.5 text-[13px] text-white/40">Member since {joined}</p>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
          <button
            type="button"
            onClick={pick}
            disabled={pending}
            className="rounded-full border border-white/15 px-3.5 py-1.5 text-[13px] font-semibold text-white transition-colors hover:bg-white/10 disabled:pointer-events-none disabled:opacity-60"
          >
            {pending ? "Saving…" : uploaded ? "Change photo" : "Upload photo"}
          </button>
          {uploaded && !pending ? (
            <button type="button" onClick={remove} className="text-[13px] font-semibold text-white/55 transition-colors hover:text-white">
              Remove
            </button>
          ) : null}
          {state?.error ? (
            <p role="alert" className="text-[13px] font-medium text-red-300">
              {state.error}
            </p>
          ) : state?.message && !pending ? (
            <p role="status" className="text-[13px] font-medium text-neon">
              {state.message}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
