import path from "node:path";
import fs from "node:fs/promises";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { env } from "../config/env.js";

const localRoot = path.resolve(process.cwd(), "uploads");

const r2Enabled = env.storageProvider === "r2";

const r2 = r2Enabled
  ? new S3Client({
      region: "auto",
      endpoint: env.r2Endpoint,

      credentials: {
        accessKeyId: env.r2AccessKeyId,

        secretAccessKey: env.r2SecretAccessKey,
      },
    })
  : null;

function normalizeBaseUrl(value) {
  return String(value || "").replace(/\/$/, "");
}

export function getStorageProvider() {
  return env.storageProvider;
}

export function publicUrlForKey(key) {
  if (r2Enabled) {
    return `${normalizeBaseUrl(env.r2PublicBaseUrl)}/${key
      .split("/")
      .map(encodeURIComponent)
      .join("/")}`;
  }

  return `/uploads/${key}`;
}

export async function putBuffer({
  key,
  body,
  contentType,
  cacheControl = "public, max-age=31536000, immutable",
}) {
  if (r2Enabled) {
    await r2.send(
      new PutObjectCommand({
        Bucket: env.r2Bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
        CacheControl: cacheControl,
      }),
    );

    return {
      provider: "r2",
      key,
      url: publicUrlForKey(key),
    };
  }

  const destination = path.resolve(localRoot, key);

  if (
    destination !== localRoot &&
    !destination.startsWith(`${localRoot}${path.sep}`)
  ) {
    throw new Error("Invalid local storage key");
  }

  await fs.mkdir(path.dirname(destination), {
    recursive: true,
  });

  await fs.writeFile(destination, body);

  return {
    provider: "local",
    key,
    url: publicUrlForKey(key),
  };
}

export async function deleteObject({ provider, key, url }) {
  if (provider === "r2" || (provider === undefined && r2Enabled)) {
    if (!r2) {
      throw new Error("R2 storage is not configured");
    }

    await r2.send(
      new DeleteObjectCommand({
        Bucket: env.r2Bucket,
        Key: key,
      }),
    );

    return;
  }

  const localKey =
    key ||
    (typeof url === "string" && url.startsWith("/uploads/")
      ? url.slice("/uploads/".length)
      : null);

  if (!localKey) {
    return;
  }

  const destination = path.resolve(localRoot, localKey);

  if (
    destination !== localRoot &&
    !destination.startsWith(`${localRoot}${path.sep}`)
  ) {
    throw new Error("Invalid local storage key");
  }

  await fs.unlink(destination).catch(() => {});
}

export function keyFromLocalUrl(url) {
  if (typeof url !== "string" || !url.startsWith("/uploads/")) {
    return null;
  }

  return url.slice("/uploads/".length);
}
