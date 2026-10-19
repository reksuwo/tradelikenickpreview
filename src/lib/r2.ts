import "server-only";
import {
  AbortMultipartUploadCommand,
  CompleteMultipartUploadCommand,
  CreateMultipartUploadCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
  UploadPartCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

/**
 * Private Cloudflare R2 bucket holding course videos and book files. Nothing
 * in it is public: members get short-lived signed links after we check they
 * may open the file.
 *
 *   Lectures/lecture-01.mp4          the first course videos
 *   Lectures/<course id>/<file>      videos uploaded from the admin panel
 *   Thumbnails/<file>                lecture thumbnails uploaded from the admin panel
 *   Avatars/<user id>-<n>.<ext>      profile photos members upload
 *   Books/<book id>.pdf              one PDF per book (ids in lib/books.ts)
 */

let client: S3Client | undefined;
let writer: S3Client | undefined;

function env(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set. Add it to .env (see .env.example).`);
  return value;
}

function r2() {
  client ??= new S3Client({
    region: "auto",
    endpoint: env("R2_ENDPOINT"),
    credentials: { accessKeyId: env("R2_ACCESS_KEY_ID"), secretAccessKey: env("R2_SECRET_ACCESS_KEY") },
    // R2 doesn't support the checksums newer AWS SDKs add by default.
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED",
  });
  return client;
}

/** A link to one file that works for `expiresIn` seconds. Pass `downloadName` to save it rather than open it. */
export function signedUrl(key: string, { expiresIn = 60 * 60 * 3, downloadName }: { expiresIn?: number; downloadName?: string } = {}) {
  return getSignedUrl(
    r2(),
    new GetObjectCommand({
      Bucket: env("R2_BUCKET"),
      Key: key,
      ResponseContentDisposition: downloadName
        ? `attachment; filename="${downloadName.replace(/["\\]/g, "")}"`
        : undefined,
    }),
    { expiresIn },
  );
}

export async function objectExists(key: string) {
  try {
    await r2().send(new HeadObjectCommand({ Bucket: env("R2_BUCKET"), Key: key }));
    return true;
  } catch (error) {
    if ((error as { $metadata?: { httpStatusCode?: number } }).$metadata?.httpStatusCode === 404) return false;
    throw error;
  }
}

/**
 * Client for admin uploads. Uses the Read & Write token when one is set
 * (R2_WRITE_ACCESS_KEY_ID / R2_WRITE_SECRET_ACCESS_KEY), so the token members'
 * downloads run on can stay read-only.
 */
function r2Write() {
  const id = process.env.R2_WRITE_ACCESS_KEY_ID;
  const secret = process.env.R2_WRITE_SECRET_ACCESS_KEY;
  if (!id || !secret) return r2();
  writer ??= new S3Client({
    region: "auto",
    endpoint: env("R2_ENDPOINT"),
    credentials: { accessKeyId: id, secretAccessKey: secret },
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED",
  });
  return writer;
}

/**
 * Starts a multipart upload the browser sends straight to R2, one signed PUT
 * per part, so large videos never pass through our server. The bucket's CORS
 * policy must allow PUT from the site and expose the ETag header.
 */
export async function startMultipartUpload(key: string, contentType: string, partCount: number) {
  const bucket = env("R2_BUCKET");
  const { UploadId } = await r2Write().send(
    new CreateMultipartUploadCommand({ Bucket: bucket, Key: key, ContentType: contentType }),
  );
  if (!UploadId) throw new Error("R2 did not return an upload id");

  const partUrls = await Promise.all(
    Array.from({ length: partCount }, (_, i) =>
      getSignedUrl(r2Write(), new UploadPartCommand({ Bucket: bucket, Key: key, UploadId, PartNumber: i + 1 }), {
        expiresIn: 60 * 60 * 6,
      }),
    ),
  );
  return { uploadId: UploadId, partUrls };
}

export async function completeMultipartUpload(key: string, uploadId: string, parts: { partNumber: number; etag: string }[]) {
  await r2Write().send(
    new CompleteMultipartUploadCommand({
      Bucket: env("R2_BUCKET"),
      Key: key,
      UploadId: uploadId,
      MultipartUpload: { Parts: parts.map((p) => ({ PartNumber: p.partNumber, ETag: p.etag })) },
    }),
  );
}

export async function abortMultipartUpload(key: string, uploadId: string) {
  await r2Write().send(new AbortMultipartUploadCommand({ Bucket: env("R2_BUCKET"), Key: key, UploadId: uploadId }));
}

/** Uploads one small file in a single request (profile photos). */
export async function putObject(key: string, body: Uint8Array, contentType: string) {
  await r2Write().send(new PutObjectCommand({ Bucket: env("R2_BUCKET"), Key: key, Body: body, ContentType: contentType }));
}

export async function deleteObject(key: string) {
  await r2Write().send(new DeleteObjectCommand({ Bucket: env("R2_BUCKET"), Key: key }));
}

/** Streams one object, for files we serve ourselves (thumbnails). Null when it doesn't exist. */
export async function getObject(key: string) {
  try {
    const result = await r2().send(new GetObjectCommand({ Bucket: env("R2_BUCKET"), Key: key }));
    return result.Body ? { body: result.Body.transformToWebStream(), contentType: result.ContentType } : null;
  } catch (error) {
    const status = (error as { $metadata?: { httpStatusCode?: number } }).$metadata?.httpStatusCode;
    if (status === 404 || (error as { name?: string }).name === "NoSuchKey") return null;
    throw error;
  }
}
