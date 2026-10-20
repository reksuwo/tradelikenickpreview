"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { cancelUpload, finishUpload, startUpload } from "@/lib/admin-actions";
import { BUTTON_QUIET } from "./admin-ui";

const TYPES: Record<string, string> = { webp: "image/webp", jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png" };

/** PUTs the image straight to R2. Resolves with its ETag. */
function put(url: string, body: Blob) {
  return new Promise<string>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.onload = () => {
      const etag = xhr.getResponseHeader("ETag");
      if (xhr.status >= 200 && xhr.status < 300 && etag) resolve(etag);
      else reject(new Error(xhr.status >= 200 && xhr.status < 300 ? "cors" : `status ${xhr.status}`));
    };
    xhr.onerror = () => reject(new Error("network"));
    xhr.send(body);
  });
}

/** Upload or replace a lecture's thumbnail. The image goes straight from the browser to R2. */
export function ThumbnailUploader({ lectureId }: { lectureId: string }) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ error?: string; message?: string }>({});

  async function handle(file: File) {
    const type = file.type || TYPES[file.name.split(".").pop()?.toLowerCase() ?? ""] || "";
    if (!type.startsWith("image/")) return setNotice({ error: "Choose a WebP, JPEG or PNG image." });

    setBusy(true);
    setNotice({});
    try {
      const ticket = await startUpload({ lectureId, kind: "thumbnail", contentType: type, size: file.size });
      if ("error" in ticket) throw new Error(ticket.error);
      let etag: string;
      try {
        etag = await put(ticket.partUrls[0], file);
      } catch (error) {
        await cancelUpload({ key: ticket.key, uploadId: ticket.uploadId });
        const reason = (error as Error).message;
        throw new Error(
          reason === "cors" || reason === "network"
            ? "The upload was blocked. Check the R2 bucket's CORS policy allows PUT from this site and exposes the ETag header."
            : "The upload failed. Try again.",
        );
      }
      const result = await finishUpload({ lectureId, kind: "thumbnail", key: ticket.key, uploadId: ticket.uploadId, parts: [{ partNumber: 1, etag }] });
      if (result?.error) throw new Error(result.error);
      setNotice({ message: "Thumbnail updated." });
      router.refresh();
    } catch (error) {
      setNotice({ error: (error as Error).message || "The upload failed." });
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed border-white/20 bg-white/[0.02] p-5">
        <p className="text-[13.5px] text-white/55">16:9 image, at least 1280 wide. WebP, JPEG or PNG.</p>
        <button type="button" disabled={busy} onClick={() => input.current?.click()} className={BUTTON_QUIET}>
          {busy ? "Uploading…" : "Choose image"}
        </button>
        <input
          ref={input}
          type="file"
          accept="image/webp,image/jpeg,image/png"
          className="sr-only"
          tabIndex={-1}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handle(file);
          }}
        />
      </div>
      {notice.error || notice.message ? (
        <p role={notice.error ? "alert" : "status"} className={`mt-2 text-[13px] font-semibold ${notice.error ? "text-[#ff9384]" : "text-neon"}`}>
          {notice.error ?? notice.message}
        </p>
      ) : null}
    </div>
  );
}
