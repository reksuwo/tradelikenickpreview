import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ActionForm, Submit } from "@/components/admin/action-form";
import { BUTTON, BUTTON_DANGER, Badge, Card, INPUT, LABEL, dateTime } from "@/components/admin/admin-ui";
import { LectureUploader } from "@/components/admin/lecture-uploader";
import { requireAdmin } from "@/lib/admin";
import { deleteLecture, updateLecture } from "@/lib/admin-actions";
import { COURSES } from "@/lib/courses";
import { getLectureRecord, thumbnailUrl } from "@/lib/lecture-store";
import { clockTime } from "@/lib/lectures";
import { objectExists, signedUrl } from "@/lib/r2";

type Props = { params: Promise<{ course: string; lecture: string }> };

export const metadata: Metadata = { title: "Edit lecture" };

/** A link to watch the current upload here, or why there isn't one. */
async function preview(key: string | null) {
  if (!key) return { error: "No video yet." };
  try {
    if (!(await objectExists(key))) return { error: `The file ${key} isn't in the bucket.` };
    return { src: await signedUrl(key, { expiresIn: 60 * 60 }) };
  } catch (error) {
    console.error("admin: video preview failed", error);
    return { error: "Couldn't reach R2 to load the video." };
  }
}

export default async function EditLecture({ params }: Props) {
  await requireAdmin();
  const { course: courseId, lecture: lectureId } = await params;
  const course = COURSES.find((c) => c.id === courseId);
  const lecture = await getLectureRecord(lectureId);
  if (!course || !lecture || lecture.courseId !== course.id) notFound();

  const video = await preview(lecture.videoKey);

  return (
    <>
      <Link href={`/admin/courses/${course.id}`} className="text-[14px] font-semibold text-white/55 hover:text-white">
        ← {course.title}
      </Link>
      <div className="mb-8 mt-3 flex flex-wrap items-center gap-3">
        <h1 className="text-[clamp(1.6rem,3vw,2.1rem)] font-extrabold leading-tight text-white">
          {lecture.position}. {lecture.title}
        </h1>
        {lecture.published ? <Badge tone="good">Published</Badge> : <Badge tone="warn">Draft</Badge>}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.25fr_1fr]">
        <div className="space-y-6">
          <Card title="Video" description={lecture.videoKey ? `Stored as ${lecture.videoKey}` : "Upload the lecture video. Large files upload in parts and can take a while."}>
            <div className="mb-4 aspect-video overflow-hidden rounded-xl bg-black ring-1 ring-white/10">
              {"src" in video ? (
                <video src={video.src} poster={thumbnailUrl(lecture.thumbnail)} controls preload="metadata" className="size-full" />
              ) : (
                <div className="grid size-full place-items-center p-6 text-center text-[14px] text-white/50">{video.error}</div>
              )}
            </div>
            <LectureUploader lectureId={lecture.id} kind="video" hasThumbnail={Boolean(lecture.thumbnail)} />
            <p className="mt-3 text-[12.5px] leading-relaxed text-white/40">
              Export MP4 with H.264 video and AAC audio, with &ldquo;fast start&rdquo; (web optimized) turned on so it plays
              before it has fully loaded. Replacing a video keeps members&apos; progress.
            </p>
          </Card>

          <Card title="Thumbnail" description="Shown on lecture cards and before the video plays.">
            <div className="flex flex-wrap items-start gap-5">
              <div className="relative aspect-video w-[220px] shrink-0 overflow-hidden rounded-lg bg-black ring-1 ring-white/10">
                <Image src={thumbnailUrl(lecture.thumbnail)} alt="" fill sizes="220px" className="object-cover" />
              </div>
              <div className="min-w-[240px] flex-1">
                <LectureUploader lectureId={lecture.id} kind="thumbnail" />
                {lecture.thumbnail ? null : (
                  <p className="mt-2 text-[12.5px] text-white/40">Uploading a video makes one from its frames if you skip this.</p>
                )}
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Details">
            <ActionForm action={updateLecture} className="space-y-4">
              <input type="hidden" name="id" value={lecture.id} />
              <div>
                <label htmlFor="title" className={LABEL}>
                  Title
                </label>
                <input id="title" name="title" required minLength={2} defaultValue={lecture.title} className={INPUT} />
              </div>
              <div>
                <label htmlFor="description" className={LABEL}>
                  Description
                </label>
                <textarea id="description" name="description" rows={4} defaultValue={lecture.description} className={INPUT} />
              </div>
              <div>
                <label htmlFor="duration" className={LABEL}>
                  Length
                </label>
                <input
                  id="duration"
                  name="duration"
                  inputMode="numeric"
                  pattern="[0-9:]*"
                  placeholder="12:34"
                  defaultValue={lecture.seconds ? clockTime(lecture.seconds) : ""}
                  className={`${INPUT} max-w-[140px] tabnum`}
                />
                <p className="mt-1 text-[12.5px] text-white/40">Filled in from the video when you upload one.</p>
              </div>

              <fieldset className="space-y-3 rounded-xl border border-white/10 p-4">
                <legend className="px-1 text-[13px] font-semibold text-white/70">Visibility</legend>
                <label className="flex items-start gap-3 text-[14px]">
                  <input type="checkbox" name="published" defaultChecked={lecture.published} className="mt-1 size-4 accent-[#00ff85]" />
                  <span>
                    <span className="font-semibold text-white">Published</span>
                    <span className="block text-[12.5px] text-white/45">Members can see it. Needs a video.</span>
                  </span>
                </label>
                <label className="flex items-start gap-3 text-[14px]">
                  <input type="checkbox" name="free" defaultChecked={lecture.free} className="mt-1 size-4 accent-[#00ff85]" />
                  <span>
                    <span className="font-semibold text-white">Free preview</span>
                    <span className="block text-[12.5px] text-white/45">Any member can watch it without buying the course.</span>
                  </span>
                </label>
                {lecture.published ? null : (
                  <label className="flex items-start gap-3 text-[14px]">
                    <input type="checkbox" name="notify" className="mt-1 size-4 accent-[#00ff85]" />
                    <span>
                      <span className="font-semibold text-white">Tell members when it&apos;s published</span>
                      <span className="block text-[12.5px] text-white/45">Sends a &ldquo;New lecture&rdquo; notification to everyone.</span>
                    </span>
                  </label>
                )}
              </fieldset>

              <Submit className={BUTTON} pending="Saving…">
                Save
              </Submit>
            </ActionForm>
            <p className="mt-4 text-[12.5px] text-white/35">Last changed {dateTime(lecture.updatedAt)}</p>
          </Card>

          <Card title="Delete lecture" description="Removes it, its uploaded files and every member's progress in it. This can't be undone.">
            <ActionForm action={deleteLecture} confirm={`Delete "${lecture.title}" and its files? This can't be undone.`} className="space-y-2">
              <input type="hidden" name="id" value={lecture.id} />
              <Submit className={BUTTON_DANGER} pending="Deleting…">
                Delete lecture
              </Submit>
            </ActionForm>
          </Card>
        </div>
      </div>
    </>
  );
}
