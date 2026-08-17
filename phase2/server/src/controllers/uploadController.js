import path from "node:path";
import fs from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { Asset } from "../models/Asset.js";
import { sanitizeSvg } from "../utils/sanitizeSvg.js";
import { putBuffer } from "../services/storage.js";

async function hasSignature(filePath, mimeType) {
  const handle = await fs.open(filePath, "r");
  try {
    const buffer = Buffer.alloc(16);
    const { bytesRead } = await handle.read(buffer, 0, buffer.length, 0);
    const b = buffer.subarray(0, bytesRead);
    if (mimeType === "image/png")
      return (
        b.length >= 8 &&
        b
          .subarray(0, 8)
          .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
      );
    if (mimeType === "image/jpeg")
      return b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff;
    if (mimeType === "image/gif")
      return (
        b.subarray(0, 6).toString("ascii") === "GIF87a" ||
        b.subarray(0, 6).toString("ascii") === "GIF89a"
      );
    if (mimeType === "image/webp")
      return (
        b.length >= 12 &&
        b.subarray(0, 4).toString("ascii") === "RIFF" &&
        b.subarray(8, 12).toString("ascii") === "WEBP"
      );
    if (mimeType === "image/bmp")
      return b.subarray(0, 2).toString("ascii") === "BM";
    if (mimeType === "image/tiff")
      return (
        (b[0] === 0x49 && b[1] === 0x49 && b[2] === 0x2a && b[3] === 0x00) ||
        (b[0] === 0x4d && b[1] === 0x4d && b[2] === 0x00 && b[3] === 0x2a)
      );
    return false;
  } finally {
    await handle.close();
  }
}

export async function uploadImage(req, res) {
  if (!req.file)
    return res.status(400).json({ message: "Image file is required" });

  const width = Number(req.body.width);
  const height = Number(req.body.height);
  if (
    !Number.isFinite(width) ||
    width < 1 ||
    !Number.isFinite(height) ||
    height < 1
  ) {
    await fs.unlink(req.file.path).catch(() => {});
    return res
      .status(400)
      .json({ message: "Valid image width and height are required" });
  }

  const isSvg =
    req.file.mimetype === "image/svg+xml" ||
    path.extname(req.file.originalname).toLowerCase() === ".svg";
  if (!isSvg && !(await hasSignature(req.file.path, req.file.mimetype))) {
    await fs.unlink(req.file.path).catch(() => {});
    return res.status(400).json({
      message:
        "The uploaded image content does not match its declared image type.",
    });
  }

  let body;
  let mimeType;
  if (isSvg) {
    const source = await fs.readFile(req.file.path, "utf8");
    const sanitized = sanitizeSvg(source);
    body = Buffer.from(sanitized, "utf8");
    mimeType = "image/svg+xml";
    if (body.length > 10 * 1024 * 1024) {
      await fs.unlink(req.file.path).catch(() => {});
      return res
        .status(400)
        .json({ message: "SVG file is too large after sanitization." });
    }
  } else {
    body = await fs.readFile(req.file.path);
    mimeType = req.file.mimetype;
  }

  const extension = isSvg
    ? ".svg"
    : path.extname(req.file.originalname).toLowerCase() || ".bin";
  const storageKey = `users/${req.user._id.toString()}/assets/${randomUUID()}${extension}`;

  try {
    const stored = await putBuffer({
      key: storageKey,
      body,
      contentType: mimeType,
    });
    const asset = await Asset.create({
      userId: req.user._id,
      type: isSvg ? "svg" : "image",
      storageProvider: stored.provider,
      storageKey: stored.key,
      url: stored.url,
      name: req.file.originalname,
      width: Math.round(width),
      height: Math.round(height),
      mimeType,
      size: body.length,
    });

    await fs.unlink(req.file.path).catch(() => {});
    res.status(201).json({
      asset: {
        id: asset._id.toString(),
        type: asset.type,
        name: asset.name,
        mimeType: asset.mimeType,
        size: asset.size,
        width: asset.width,
        height: asset.height,
        url: asset.url,
        createdAt: asset.createdAt,
      },
    });
  } catch (error) {
    await fs.unlink(req.file.path).catch(() => {});
    throw error;
  }
}
