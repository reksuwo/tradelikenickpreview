"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { cancelUpload, finishUpload, startUpload, type UploadKind } from "@/lib/admin-actions";
import { BUTTON, BUTTON_QUIET } from "./admin-ui";

/** Parts in flight at once. */
const CONCURRENCY = 4;
const RETRIES = 3;

const BY_EXTENSION: Record<string, string> = {
  mp4: "video/mp4",
  m4v: "video/mp4",
  webm: "video/webm",
  mov: "video/quicktime",
  webp: "image/webp",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
};

function contentType(file: File | Blob, name = "") {
  return file.type || BY_EXTENSION[name.split(".").pop()?.toLowerCase() ?? ""] || "";
}

function mb(bytes: number) {
  return bytes >= 1024 ** 3 ? `${(bytes / 1024 ** 3).toFixed(2)} GB` : `${(bytes / 1024 ** 2).toFixed(1)} MB`;
}

/** Reads a video file's length and grabs one frame as a WebP thumbnail, without uploading anything. */
async function inspectVideo(file: File): Promise<{ seconds: number; frame: Blob | null }> {
  const url = URL.createObjectURL(file);
  const video = document.createElement("video");
  video.muted = true;
  video.preload = "auto";
  video.src = url;
  try {
    await new Promise<void>((resolve, reject) => {
      video.onloadedmetadata = () => resolve();
      video.onerror = () => reject(new Error("unreadable"));
    });
    const seconds = Number.isFinite(video.duration) ? Math.round(video.duration) : 0;

    // A frame a little way in, past any fade from black.
    video.currentTime = Math.min(Math.max(1, seconds * 0.1), 30);
    await new Promise<void>((resolve) => {
      video.onseeked = () => resolve();
      setTimeout(resolve, 5000);
    });
    let frame: Blob | null = null;
    if (video.videoWidth) {
      const canvas = document.createElement("canvas");
      canvas.width = 1280;
      canvas.height = Math.round((1280 * video.videoHeight) / video.videoWidth);
      canvas.getContext("2d")?.drawImage(video, 0, 0, canvas.width, canvas.height);
      frame = await new Promise((resolve) => canvas.toBlob(resolve, "image/webp", 0.85));
    }
    return { seconds, frame };
  } catch {
    return { seconds: 0, frame: null };
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** PUTs one part, reporting bytes sent. Resolves with the part's ETag. */
function putPart(url: string, body: Blob, onBytes: (sent: number) => void, signal: AbortSignal) {
  return new Promise<string>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.upload.onprogress = (e) => onBytes(e.loaded);
    xhr.onload = () => {
      const etag = xhr.getResponseHeader("ETag");
      if (xhr.status >= 200 && xhr.status < 300 && etag) resolve(etag);
      else if (xhr.status >= 200 && xhr.status < 300) reject(new Error("cors"));
      else reject(new Error(`status ${xhr.status}`));
    };
    xhr.onerror = () => reject(new Error("network"));
    xhr.onabort = () => reject(new DOMException("Aborted", "AbortError"));
    signal.addEventListener("abort", () => xhr.abort(), { once: true });
    xhr.send(body);
  });
}

/** Sends a file to R2 in parts, straight from the browser, then attaches it to the lecture. */
async function upload(
  lectureId: string,
  kind: UploadKind,
  file: Blob,
  type: string,
  onProgress: (sent: number) => void,
  signal: AbortSignal,
  seconds?: number,
) {
  const ticket = await startUpload({ lectureId, kind, contentType: type, size: file.size });
  if ("error" in ticket) throw new Error(ticket.error);

  const sent = new Array<number>(ticket.partUrls.length).fill(0);
  const parts: { partNumber: number; etag: string }[] = [];
  let next = 0;

  const worker = async () => {
    while (next < ticket.partUrls.length) {
      const i = next++;
      const body = file.slice(i * ticket.partSize, (i + 1) * ticket.partSize);
      for (let attempt = 1; ; attempt++) {
        try {
          const etag = await putPart(
            ticket.partUrls[i],
            body,
            (bytes) => {
              sent[i] = bytes;
              onProgress(sent.reduce((a, b) => a + b, 0));
            },
            signal,
          );
          parts.push({ partNumber: i + 1, etag });
          break;
        } catch (error) {
          const reason = (error as Error).message;
          if (signal.aborted || reason === "cors" || attempt >= RETRIES) throw error;
          sent[i] = 0;
          await new Promise((r) => setTimeout(r, 1000 * attempt));
        }
      }
    }
  };

  try {
    await Promise.all(Array.from({ length: Math.min(CONCURRENCY, ticket.partUrls.length) }, worker));
  } catch (error) {
    await cancelUpload({ key: ticket.key, uploadId: ticket.uploadId });
    const reason = (error as Error).message;
    if ((error as Error).name === "AbortError") throw error;
    throw new Error(
      reason === "cors" || reason === "network"
        ? "The upload was blocked. Check the R2 bucket's CORS policy allows PUT from this site and exposes the ETag header."
        : "The upload failed partway. Check your connection and try again.",
    );
  }

  parts.sort((a, b) => a.partNumber - b.partNumber);
  const result = await finishUpload({ lectureId, kind, key: ticket.key, uploadId: ticket.uploadId, parts, seconds });
  if (result?.error) throw new Error(result.error);
}

type Status =
  | { state: "idle" }
  | { state: "reading" }
  | { state: "uploading"; label: string; sent: number; total: number; startedAt: number; at: number }
  | { state: "done"; message: string }
  | { state: "error"; message: string };

/**
 * Upload or replace a lecture's video or thumbnail. Uploading a video also
 * fills in the running time, and makes a thumbnail from one of its frames
 * when the lecture doesn't have one yet.
 */
export function LectureUploader({
  lectureId,
  kind,
  hasThumbnail = true,
}: {
  lectureId: string;
  kind: UploadKind;
  /** When false, a video upload also sets a thumbnail from its frames. */
  hasThumbnail?: boolean;
}) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const controller = useRef<AbortController | null>(null);
  const [status, setStatus] = useState<Status>({ state: "idle" });
  const [dragging, setDragging] = useState(false);
  const busy = status.state === "reading" || status.state === "uploading";

  // Leaving mid-upload loses it; ask first.
  useEffect(() => {
    if (!busy) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [busy]);

  async function handle(file: File) {
    const type = contentType(file, file.name);
    const accepted = kind === "video" ? type.startsWith("video/") : type.startsWith("image/");
    if (!accepted) {
      setStatus({ state: "error", message: kind === "video" ? "Choose a video file." : "Choose an image file." });
      return;
    }

    const abort = new AbortController();
    controller.current = abort;
    try {
      let seconds: number | undefined;
      let frame: Blob | null = null;
      if (kind === "video") {
        setStatus({ state: "reading" });
        ({ seconds, frame } = await inspectVideo(file));
      }

      const startedAt = Date.now();
      setStatus({ state: "uploading", label: file.name, sent: 0, total: file.size, startedAt, at: startedAt });
      await upload(lectureId, kind, file, type, (sent) => setStatus({ state: "uploading", label: file.name, sent, total: file.size, startedAt, at: Date.now() }), abort.signal, seconds);

      if (kind === "video" && frame && !hasThumbnail) {
        await upload(lectureId, "thumbnail", frame, "image/webp", () => {}, abort.signal).catch((e) =>
          console.error("Thumbnail from video failed", e),
        );
      }

      setStatus({
        state: "done",
        message: kind === "video" ? `Uploaded ${file.name}${seconds ? ` (${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")})` : ""}.` : "Thumbnail updated.",
      });
      router.refresh();
    } catch (error) {
      setStatus(
        (error as Error).name === "AbortError"
          ? { state: "idle" }
          : { state: "error", message: (error as Error).message || "The upload failed." },
      );
    } finally {
      controller.current = null;
      if (input.current) input.current.value = "";
    }
  }

  const uploading = status.state === "uploading" ? status : null;
  const pct = uploading ? Math.floor((uploading.sent / uploading.total) * 100) : 0;
  const elapsed = uploading ? (uploading.at - uploading.startedAt) / 1000 : 0;
  const rate = uploading && elapsed > 1 ? uploading.sent / elapsed : 0;
  const remaining = uploading && rate ? Math.round((uploading.total - uploading.sent) / rate) : null;

  return (
    <div>
      <div
        onDragOver={(e) => {
          if (busy) return;
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const file = e.dataTransfer.files[0];
          if (file && !busy) handle(file);
        }}
        className={`rounded-xl border border-dashed p-5 transition-colors ${
          dragging ? "border-neon bg-neon/5" : "border-white/20 bg-white/[0.02]"
        }`}
      >
        {uploading ? (
          <div>
            <div className="flex items-baseline justify-between gap-3 text-[13.5px]">
              <span className="truncate font-semibold text-white">{uploading.label}</span>
              <span className="shrink-0 tabnum text-white/60">{pct}%</span>
            </div>
            <div
              role="progressbar"
              aria-valuenow={pct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Upload progress"
              className="mt-2 h-2 overflow-hidden rounded-full bg-white/10"
            >
              <div className="h-full rounded-full bg-neon transition-[width] duration-300" style={{ width: `${pct}%` }} />
            </div>
            <div className="mt-2 flex items-center justify-between gap-3 text-[12.5px] tabnum text-white/50">
              <span>
                {mb(uploading.sent)} of {mb(uploading.total)}
                {rate ? ` · ${mb(rate)}/s` : ""}
                {remaining != null ? ` · about ${remaining > 90 ? `${Math.round(remaining / 60)} min` : `${remaining}s`} left` : ""}
              </span>
              <button type="button" onClick={() => controller.current?.abort()} className="font-semibold text-white/70 hover:text-white">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-[13.5px] text-white/55">
              {status.state === "reading"
                ? "Reading the video…"
                : kind === "video"
                  ? "Drop a video here, or choose a file. MP4 (H.264) plays everywhere."
                  : "Drop an image here, or choose one. 16:9, at least 1280 wide."}
            </p>
            <button type="button" disabled={busy} onClick={() => input.current?.click()} className={kind === "video" ? BUTTON : BUTTON_QUIET}>
              {kind === "video" ? "Choose video" : "Choose image"}
            </button>
          </div>
        )}
        <input
          ref={input}
          type="file"
          accept={kind === "video" ? "video/mp4,video/webm,video/quicktime,.mp4,.m4v,.webm,.mov" : "image/webp,image/jpeg,image/png"}
          className="sr-only"
          tabIndex={-1}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handle(file);
          }}
        />
      </div>
      {status.state === "done" || status.state === "error" ? (
        <p role={status.state === "error" ? "alert" : "status"} className={`mt-2 text-[13px] font-semibold ${status.state === "error" ? "text-[#ff9384]" : "text-neon"}`}>
          {status.message}
        </p>
      ) : null}
    </div>
  );
}
