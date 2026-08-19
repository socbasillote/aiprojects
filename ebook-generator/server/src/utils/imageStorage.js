import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

const uploadsRoot = path.resolve(__dirname, "../../uploads");

const saveBase64Image = async ({ ebookId, imageNumber, base64 }) => {
  const ebookDirectory = path.join(uploadsRoot, "ebooks", String(ebookId));

  await fs.mkdir(ebookDirectory, {
    recursive: true,
  });

  const filename = `image-${imageNumber}.png`;

  const filepath = path.join(ebookDirectory, filename);

  const buffer = Buffer.from(base64, "base64");

  await fs.writeFile(filepath, buffer);

  console.log("IMAGE SAVED:", filepath);

  return `/uploads/ebooks/${ebookId}/${filename}`;
};

export default {
  saveBase64Image,
};
