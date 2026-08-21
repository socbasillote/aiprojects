import fs from "fs/promises";
import path from "path";
import { createWriteStream } from "fs";
import { ZipArchive } from "archiver";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serverRoot = path.resolve(__dirname, "../../../");
const uploadsRoot = path.join(serverRoot, "uploads");

const escapeXml = (value) =>
  String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");

const resolveImage = async (imageUrl) => {
  if (!imageUrl) {
    throw new Error("Image URL is empty.");
  }

  if (/^https?:\/\//i.test(imageUrl)) {
    const response = await fetch(imageUrl);

    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.status}`);
    }

    return Buffer.from(await response.arrayBuffer());
  }

  const normalizedUrl = String(imageUrl)
    .replace(/\\/g, "/")
    .split("?")[0]
    .split("#")[0]
    .replace(/^\/+/, "");

  if (!normalizedUrl.toLowerCase().startsWith("uploads/")) {
    throw new Error(`Invalid local image URL: ${imageUrl}`);
  }

  const imagePath = path.resolve(serverRoot, normalizedUrl);
  const normalizedUploadsRoot = path.resolve(uploadsRoot);

  if (!imagePath.startsWith(`${normalizedUploadsRoot}${path.sep}`)) {
    throw new Error("Invalid image path.");
  }

  return fs.readFile(imagePath);
};

const getChapterImages = ({ ebook, chapter }) => {
  const sourceImages = (ebook.images || [])
    .filter(
      (image) =>
        Number(image.chapterNumber) === Number(chapter.chapterNumber) &&
        (image.status === "generated" || image.status === "approved"),
    )
    .map((image) => ({
      imageNumber: Number(image.imageNumber),
      title: image.title || "",
      url:
        image.url ||
        `/uploads/ebooks/${ebook._id}/image-${image.imageNumber}.png`,
      altText: image.altText || "",
    }));

  const images = new Map();

  for (const image of [...sourceImages, ...(chapter.images || [])]) {
    if (image?.imageNumber !== undefined && image?.imageNumber !== null) {
      const imageNumber = Number(image.imageNumber);
      images.set(imageNumber, {
        ...images.get(imageNumber),
        ...image,
        url: image.url || images.get(imageNumber)?.url || "",
      });
    }
  }

  return [...images.values()].sort(
    (a, b) => Number(a.imageNumber) - Number(b.imageNumber),
  );
};

const buildChapterMarkup = ({ chapter, images }) => {
  const paragraphs = String(chapter.content || "")
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
  const imageInsertions = new Map();

  images.forEach((image, index) => {
    const paragraphIndex = Math.min(
      paragraphs.length,
      Math.floor(((index + 1) * paragraphs.length) / (images.length + 1)),
    );
    const existing = imageInsertions.get(paragraphIndex) || [];
    existing.push(image);
    imageInsertions.set(paragraphIndex, existing);
  });

  const markup = [];

  for (let index = 0; index <= paragraphs.length; index += 1) {
    for (const image of imageInsertions.get(index) || []) {
      const imageName = `image-${image.imageNumber}.png`;
      markup.push(
        `<figure><img src="images/${imageName}" alt="${escapeXml(image.altText || image.title)}"/><figcaption>${escapeXml(image.title)}</figcaption></figure>`,
      );
    }

    if (paragraphs[index]) {
      markup.push(
        `<p>${escapeXml(paragraphs[index]).replaceAll("\n", "<br/>")}</p>`,
      );
    }
  }

  return markup.join("\n");
};

const createEpub = async ({ ebook }) => {
  const ebookId = String(ebook._id);
  const ebookDirectory = path.join(uploadsRoot, "ebooks", ebookId);
  const filepath = path.join(ebookDirectory, "ebook.epub");
  const chapters = ebook.assembly?.chapters || [];
  const title = ebook.assembly?.title || ebook.title || "Untitled ebook";
  const coverUrl = ebook.assembly?.coverUrl || ebook.cover?.url;
  const imageEntries = new Map();

  await fs.mkdir(ebookDirectory, { recursive: true });

  for (const chapter of chapters) {
    for (const image of getChapterImages({ ebook, chapter })) {
      if (!imageEntries.has(Number(image.imageNumber))) {
        imageEntries.set(Number(image.imageNumber), image);
      }
    }
  }

  const chapterFiles = chapters.map((chapter) => ({
    id: `chapter-${chapter.chapterNumber}`,
    filename: `chapter-${chapter.chapterNumber}.xhtml`,
    title: chapter.title,
    content: buildChapterMarkup({
      chapter,
      images: getChapterImages({ ebook, chapter }),
    }),
  }));

  const output = createWriteStream(filepath);
  const archive = new ZipArchive({ zlib: { level: 9 } });
  archive.pipe(output);
  archive.append("application/epub+zip", { name: "mimetype", store: true });
  archive.append(
    `<?xml version="1.0" encoding="UTF-8"?><container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>`,
    { name: "META-INF/container.xml" },
  );

  const manifest = chapterFiles
    .map(
      (chapter) =>
        `<item id="${chapter.id}" href="${chapter.filename}" media-type="application/xhtml+xml"/>`,
    )
    .join("");
  const spine = chapterFiles
    .map((chapter) => `<itemref idref="${chapter.id}"/>`)
    .join("");
  const imageManifest = [...imageEntries.values()]
    .map(
      (image) =>
        `<item id="image-${image.imageNumber}" href="images/image-${image.imageNumber}.png" media-type="image/png"/>`,
    )
    .join("");
  const coverManifest = coverUrl
    ? `<item id="cover-image" href="images/cover.png" media-type="image/png" properties="cover-image"/>`
    : "";

  archive.append(
    `<?xml version="1.0" encoding="UTF-8"?><package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="book-id"><metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:identifier id="book-id">${ebookId}</dc:identifier><dc:title>${escapeXml(title)}</dc:title><dc:language>${escapeXml(ebook.settings?.language || "en")}</dc:language></metadata><manifest><item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>${coverManifest}${imageManifest}${manifest}</manifest><spine>${spine}</spine></package>`,
    { name: "OEBPS/content.opf" },
  );

  archive.append(
    `<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE html><html xmlns="http://www.w3.org/1999/xhtml"><head><title>${escapeXml(title)}</title></head><body><nav epub:type="toc" xmlns:epub="http://www.idpf.org/2007/ops"><h1>Table of Contents</h1><ol>${chapterFiles.map((chapter) => `<li><a href="${chapter.filename}">${escapeXml(chapter.title)}</a></li>`).join("")}</ol></nav></body></html>`,
    { name: "OEBPS/nav.xhtml" },
  );

  for (const chapter of chapterFiles) {
    archive.append(
      `<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE html><html xmlns="http://www.w3.org/1999/xhtml"><head><title>${escapeXml(chapter.title)}</title><style>body{font-family:serif;line-height:1.5}img{max-width:100%;height:auto}figure{text-align:center;margin:1.5em 0}figcaption{font-style:italic}</style></head><body><h1>${escapeXml(chapter.title)}</h1>${chapter.content}</body></html>`,
      { name: `OEBPS/${chapter.filename}` },
    );
  }

  if (coverUrl) {
    archive.append(await resolveImage(coverUrl), {
      name: "OEBPS/images/cover.png",
    });
  }

  for (const image of imageEntries.values()) {
    archive.append(await resolveImage(image.url), {
      name: `OEBPS/images/image-${image.imageNumber}.png`,
    });
  }

  await archive.finalize();
  await new Promise((resolve, reject) => {
    output.on("close", resolve);
    output.on("error", reject);
    archive.on("error", reject);
  });

  return `/uploads/ebooks/${ebookId}/ebook.epub`;
};

export default { createEpub };
