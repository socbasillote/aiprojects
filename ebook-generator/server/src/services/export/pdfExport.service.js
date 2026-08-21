import fs from "fs/promises";
import path from "path";
import PDFDocument from "pdfkit";
import { fileURLToPath } from "url";
import { createWriteStream } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/*
|--------------------------------------------------------------------------
| Server paths
|--------------------------------------------------------------------------
|
| pdfExport.service.js
|   server/
|     src/
|       services/
|         export/
|           pdfExport.service.js
|
| Therefore:
| ../../../ = server/
|
*/

const serverRoot = path.resolve(__dirname, "../../../");

const uploadsRoot = path.join(serverRoot, "uploads");

console.log("PDF SERVER ROOT:", serverRoot);
console.log("PDF UPLOADS ROOT:", uploadsRoot);

/*
|--------------------------------------------------------------------------
| Resolve image source
|--------------------------------------------------------------------------
*/

const getImageSource = async (imageUrl) => {
  if (!imageUrl) {
    throw new Error("Image URL is empty.");
  }

  console.log("--------------------------------------------------");
  console.log("PDF IMAGE URL:", imageUrl);

  /*
   * Remote image
   */
  if (/^https?:\/\//i.test(imageUrl)) {
    console.log("PDF IMAGE TYPE: remote");

    const response = await fetch(imageUrl);

    if (!response.ok) {
      throw new Error(
        `Failed to download image: ${response.status} ${response.statusText}`,
      );
    }

    const buffer = Buffer.from(await response.arrayBuffer());

    console.log("PDF REMOTE IMAGE SIZE:", buffer.length);

    return buffer;
  }

  /*
   * Local image
   *
   * Expected URL:
   *
   * /uploads/ebooks/<ebookId>/image-1.png
   *
   * Convert it to:
   *
   * server/uploads/ebooks/<ebookId>/image-1.png
   */

  let normalizedUrl = String(imageUrl).replace(/\\/g, "/");

  /*
   * Remove query string/hash if present.
   */
  normalizedUrl = normalizedUrl.split("?")[0].split("#")[0];

  /*
   * Remove leading slash.
   *
   * /uploads/ebooks/abc/image-1.png
   *
   * becomes:
   *
   * uploads/ebooks/abc/image-1.png
   */
  normalizedUrl = normalizedUrl.replace(/^\/+/, "");

  /*
   * Make sure this is actually an uploads path.
   */
  if (!normalizedUrl.toLowerCase().startsWith("uploads/")) {
    throw new Error(
      `Invalid local image URL. Expected /uploads/... but received: ${imageUrl}`,
    );
  }

  /*
   * Resolve against server root.
   */
  const imagePath = path.resolve(serverRoot, normalizedUrl);

  console.log("PDF RESOLVED IMAGE PATH:", imagePath);

  /*
   * Security check.
   *
   * The image must remain inside server/uploads.
   */
  const normalizedUploadsRoot = path.resolve(uploadsRoot);

  if (
    imagePath !== normalizedUploadsRoot &&
    !imagePath.startsWith(`${normalizedUploadsRoot}${path.sep}`)
  ) {
    throw new Error("Invalid image path.");
  }

  /*
   * Verify the file exists.
   */
  try {
    await fs.access(imagePath);
  } catch {
    throw new Error(`Image file does not exist: ${imagePath}`);
  }

  /*
   * Verify it is actually a file.
   */
  const stats = await fs.stat(imagePath);

  console.log("PDF IMAGE FILE:", {
    path: imagePath,
    size: stats.size,
    isFile: stats.isFile(),
  });

  if (!stats.isFile()) {
    throw new Error(`Image path is not a file: ${imagePath}`);
  }

  return imagePath;
};

const getChapterImages = ({ ebook, chapter }) => {
  const assembledImages = Array.isArray(chapter.images) ? chapter.images : [];
  const sourceImages = (ebook.images || [])
    .filter((image) => {
      const imageChapterNumber =
        image.chapterNumber === null || image.chapterNumber === undefined
          ? null
          : Number(image.chapterNumber);

      return (
        imageChapterNumber === Number(chapter.chapterNumber) &&
        (image.status === "generated" || image.status === "approved")
      );
    })
    .map((image) => ({
      imageNumber: Number(image.imageNumber),
      title: image.title || "",
      url:
        image.url ||
        `/uploads/ebooks/${ebook._id}/image-${image.imageNumber}.png`,
      altText: image.altText || "",
      type: image.type || "editorial",
    }));

  const imagesByNumber = new Map();

  for (const image of [...sourceImages, ...assembledImages]) {
    if (image?.imageNumber !== undefined && image?.imageNumber !== null) {
      const imageNumber = Number(image.imageNumber);
      const existingImage = imagesByNumber.get(imageNumber);

      imagesByNumber.set(imageNumber, {
        ...existingImage,
        ...image,
        url: image.url || existingImage?.url || "",
      });
    }
  }

  return [...imagesByNumber.values()].sort(
    (a, b) => Number(a.imageNumber || 0) - Number(b.imageNumber || 0),
  );
};

/*
|--------------------------------------------------------------------------
| Create PDF
|--------------------------------------------------------------------------
*/

const createPdf = async ({ ebook }) => {
  if (!ebook) {
    throw new Error("Ebook is required.");
  }

  if (!ebook.assembly) {
    throw new Error("Ebook assembly does not exist.");
  }

  console.log("");
  console.log("======================================");
  console.log("PDF EXPORT START");
  console.log("======================================");
  console.log("EBOOK:", ebook._id);
  console.log("ASSEMBLY STATUS:", ebook.assembly.status);
  console.log("ASSEMBLY CHAPTERS:", ebook.assembly.chapters?.length || 0);

  const chapterImages = (ebook.assembly.chapters || []).map((chapter) =>
    getChapterImages({ ebook, chapter }),
  );

  const totalImages = chapterImages.reduce(
    (total, images) => total + images.length,
    0,
  );

  console.log("TOTAL PDF IMAGES:", totalImages);
  console.log("======================================");

  /*
  |--------------------------------------------------------------------------
  | PDF output directory
  |--------------------------------------------------------------------------
  */

  const ebookDirectory = path.join(uploadsRoot, "ebooks", String(ebook._id));

  await fs.mkdir(ebookDirectory, {
    recursive: true,
  });

  const filename = "ebook.pdf";

  const filepath = path.join(ebookDirectory, filename);

  console.log("PDF OUTPUT:", filepath);

  /*
  |--------------------------------------------------------------------------
  | PDF document
  |--------------------------------------------------------------------------
  */

  const doc = new PDFDocument({
    size: "A4",

    margins: {
      top: 60,
      bottom: 60,
      left: 60,
      right: 60,
    },

    autoFirstPage: false,
  });

  const stream = createWriteStream(filepath);

  doc.pipe(stream);

  /*
  |--------------------------------------------------------------------------
  | Cover
  |--------------------------------------------------------------------------
  */

  doc.addPage();

  if (ebook.assembly.coverUrl) {
    try {
      console.log("");
      console.log("ADDING PDF COVER:");
      console.log(ebook.assembly.coverUrl);

      const coverSource = await getImageSource(ebook.assembly.coverUrl);

      doc.image(coverSource, {
        fit: [450, 500],
        align: "center",
      });

      doc.moveDown(2);

      console.log("PDF COVER ADDED");
    } catch (error) {
      console.error("PDF COVER COULD NOT BE ADDED:", error);

      throw error;
    }
  }

  /*
   * Title
   */

  doc
    .fontSize(28)
    .font("Helvetica-Bold")
    .text(ebook.assembly.title || ebook.title, {
      align: "center",
    });

  /*
   * Subtitle
   */

  if (ebook.assembly.subtitle || ebook.subtitle) {
    doc.moveDown();

    doc
      .fontSize(16)
      .font("Helvetica")
      .text(ebook.assembly.subtitle || ebook.subtitle, {
        align: "center",
      });
  }

  /*
   * Author
   */

  if (ebook.assembly.authorName || ebook.authorName) {
    doc.moveDown(2);

    doc
      .fontSize(13)
      .font("Helvetica")
      .text(ebook.assembly.authorName || ebook.authorName, {
        align: "center",
      });
  }

  /*
  |--------------------------------------------------------------------------
  | Table of contents
  |--------------------------------------------------------------------------
  */

  doc.addPage();

  doc.fontSize(22).font("Helvetica-Bold").text("Table of Contents");

  doc.moveDown();

  for (const item of ebook.assembly.tableOfContents || []) {
    doc
      .fontSize(12)
      .font("Helvetica")
      .text(`${item.chapterNumber}. ${item.title}`);

    doc.moveDown(0.5);
  }

  /*
  |--------------------------------------------------------------------------
  | Chapters
  |--------------------------------------------------------------------------
  */

  for (
    let chapterIndex = 0;
    chapterIndex < (ebook.assembly.chapters || []).length;
    chapterIndex += 1
  ) {
    const chapter = ebook.assembly.chapters[chapterIndex];
    const images = chapterImages[chapterIndex];

    doc.addPage();

    console.log("");
    console.log("======================================");
    console.log("PDF CHAPTER:", chapter.chapterNumber, chapter.title);

    console.log("PDF CHAPTER IMAGE COUNT:", images.length);

    console.log("======================================");

    /*
     * Chapter heading
     */

    doc
      .fontSize(22)
      .font("Helvetica-Bold")
      .text(`Chapter ${chapter.chapterNumber}`);

    doc.moveDown(0.5);

    doc.fontSize(20).font("Helvetica-Bold").text(chapter.title);

    doc.moveDown();

    /*
     * Chapter content
     */

    if (chapter.content) {
      doc.fontSize(11).font("Helvetica").text(chapter.content, {
        align: "left",
        lineGap: 4,
      });
    }

    /*
     |--------------------------------------------------------------------------
     | Chapter images
     |--------------------------------------------------------------------------
     */

    for (const image of images) {
      if (!image?.url) {
        console.warn("PDF IMAGE HAS NO URL:", image);

        continue;
      }

      console.log("");
      console.log("ADDING PDF IMAGE:");
      console.log({
        imageNumber: image.imageNumber,
        title: image.title,
        url: image.url,
      });

      try {
        /*
         * Resolve actual filesystem image.
         */
        const imageSource = await getImageSource(image.url);

        console.log("PDF IMAGE SOURCE:", imageSource);

        /*
         * Add spacing.
         */
        doc.moveDown();

        /*
         * Add image.
         */
        doc.image(imageSource, {
          fit: [450, 300],
          align: "center",
        });

        console.log("PDF IMAGE ADDED:", image.url);

        /*
         * Alt text / caption
         */
        if (image.altText) {
          doc.moveDown(0.5);

          doc.fontSize(9).font("Helvetica-Oblique").text(image.altText, {
            align: "center",
          });
        }

        doc.moveDown();
      } catch (error) {
        console.error("PDF IMAGE COULD NOT BE ADDED:", {
          imageNumber: image.imageNumber,
          title: image.title,
          url: image.url,
          error: error?.message,
          stack: error?.stack,
        });

        /*
         * IMPORTANT:
         *
         * Don't generate a broken PDF silently.
         */
        throw new Error(
          `Failed to add image "${image.title || image.imageNumber}": ${
            error?.message || "Unknown error"
          }`,
        );
      }
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Finish PDF
  |--------------------------------------------------------------------------
  */

  doc.end();

  await new Promise((resolve, reject) => {
    stream.on("finish", resolve);
    stream.on("error", reject);
  });

  console.log("");
  console.log("======================================");
  console.log("PDF CREATED:", filepath);
  console.log("TOTAL IMAGES:", totalImages);
  console.log("======================================");

  return `/uploads/ebooks/${ebook._id}/${filename}`;
};

export default {
  createPdf,
};
