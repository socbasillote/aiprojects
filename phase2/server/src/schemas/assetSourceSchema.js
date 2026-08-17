import { env } from "../config/env.js";

export function isAllowedAssetSource(value) {
  if (typeof value !== "string" || !value) {
    return false;
  }

  if (value.startsWith("/uploads/")) {
    return /^\/uploads\/[A-Za-z0-9_-]+\/[A-Za-z0-9._-]+$/.test(value);
  }

  if (!env.r2PublicBaseUrl) {
    return false;
  }

  const baseUrl = env.r2PublicBaseUrl.replace(/\/$/, "");

  return value.startsWith(`${baseUrl}/`) && !value.includes("..");
}
