import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsRoot = path.resolve(__dirname, "../../uploads");

const saveImageBuffer = async ({
  ebookId,
  imageNumber,
  buffer,
  extension = "png",
}) => {
  const ebookDirectory = path.join(uploadsRoot, "ebooks", String(ebookId));

  await fs.mkdir(ebookDirectory, {
    recursive: true,
  });

  const filename =
    imageNumber === "cover"
      ? `cover.${extension}`
      : `image-${imageNumber}.${extension}`;

  const filepath = path.join(ebookDirectory, filename);

  await fs.writeFile(filepath, buffer);

  console.log("IMAGE SAVED:", filepath);

  return `/uploads/ebooks/${ebookId}/${filename}`;
};

const saveBase64Image = async ({ ebookId, imageNumber, base64 }) => {
  const buffer = Buffer.from(base64, "base64");

  return saveImageBuffer({
    ebookId,
    imageNumber,
    buffer,
    extension: "png",
  });
};

const saveImageFromUrl = async ({ ebookId, imageNumber, url }) => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to download generated image: ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();

  const buffer = Buffer.from(arrayBuffer);

  if (!buffer.length) {
    throw new Error("Downloaded generated image is empty.");
  }

  console.log("DOWNLOADED IMAGE BYTES:", buffer.length);

  return saveImageBuffer({
    ebookId,
    imageNumber,
    buffer,
    extension: "png",
  });
};

export default {
  saveImageBuffer,
  saveBase64Image,
  saveImageFromUrl,
};
