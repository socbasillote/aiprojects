import fs from "fs/promises";
import path from "path";

const resolveImage = async ({ imageUrl, uploadsRoot }) => {
  if (!imageUrl) {
    throw new Error("Image URL is empty.");
  }

  /*
   * Remote image.
   */
  if (/^https?:\/\//i.test(imageUrl)) {
    const response = await fetch(imageUrl);

    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.status}`);
    }

    return Buffer.from(await response.arrayBuffer());
  }

  /*
   * Local image.
   */
  const normalizedUrl = imageUrl.replace(/\\/g, "/");

  const relativePath = normalizedUrl.replace(/^\/+/, "");

  const uploadRelativePath = relativePath.replace(/^uploads\//i, "");

  const imagePath = path.resolve(uploadsRoot, uploadRelativePath);

  const normalizedRoot = path.resolve(uploadsRoot);

  const normalizedImagePath = path.resolve(imagePath);

  if (
    normalizedImagePath !== normalizedRoot &&
    !normalizedImagePath.startsWith(`${normalizedRoot}${path.sep}`)
  ) {
    throw new Error("Invalid image path.");
  }

  await fs.access(normalizedImagePath);

  return normalizedImagePath;
};

/*
|--------------------------------------------------------------------------
| Render cover
|--------------------------------------------------------------------------
*/

const renderCover = async ({ doc, ebook, design, uploadsRoot }) => {
  doc.addPage();

  if (ebook.assembly?.coverUrl) {
    try {
      const cover = await resolveImage({
        imageUrl: ebook.assembly.coverUrl,
        uploadsRoot,
      });

      doc.image(cover, {
        fit: [
          design.page.width - design.page.margin * 2,
          design.page.height - design.page.margin * 2,
        ],
        align: "center",
        valign: "center",
      });
    } catch (error) {
      console.warn("Storybook cover image failed:", error.message);
    }
  }

  doc.moveDown(2);

  doc
    .font(design.typography.headingFont)
    .fontSize(design.typography.titleSize)
    .text(ebook.assembly.title || ebook.title, {
      align: "center",
    });

  if (ebook.assembly.subtitle || ebook.subtitle) {
    doc.moveDown();

    doc
      .font(design.typography.bodyFont)
      .fontSize(design.typography.subtitleSize)
      .text(ebook.assembly.subtitle || ebook.subtitle, {
        align: "center",
      });
  }

  if (ebook.assembly.authorName || ebook.authorName) {
    doc.moveDown();

    doc
      .font(design.typography.bodyFont)
      .fontSize(12)
      .text(ebook.assembly.authorName || ebook.authorName, {
        align: "center",
      });
  }
};

/*
|--------------------------------------------------------------------------
| Render title page
|--------------------------------------------------------------------------
*/

const renderTitlePage = ({ doc, ebook, design }) => {
  doc.addPage();

  doc.moveDown(8);

  doc
    .font(design.typography.headingFont)
    .fontSize(design.typography.titleSize)
    .text(ebook.assembly.title || ebook.title, {
      align: "center",
    });

  if (ebook.assembly.subtitle || ebook.subtitle) {
    doc.moveDown();

    doc
      .font(design.typography.bodyFont)
      .fontSize(design.typography.subtitleSize)
      .text(ebook.assembly.subtitle || ebook.subtitle, {
        align: "center",
      });
  }
};

/*
|--------------------------------------------------------------------------
| Render story spread
|--------------------------------------------------------------------------
*/

const renderStorySpread = async ({
  doc,
  chapter,
  image,
  design,
  uploadsRoot,
}) => {
  doc.addPage();

  const margin = design.storySpread.padding;

  const pageWidth = design.page.width;

  const pageHeight = design.page.height;

  const availableWidth = pageWidth - margin * 2;

  const availableHeight = pageHeight - margin * 2;

  const imageWidth = availableWidth * design.storySpread.imageWidth;

  const textWidth = availableWidth * design.storySpread.textWidth;

  const imageX = margin;

  const textX = margin + imageWidth;

  const topY = margin;

  /*
   * Image
   */

  if (image?.url) {
    try {
      const imageSource = await resolveImage({
        imageUrl: image.url,
        uploadsRoot,
      });

      doc.image(imageSource, {
        fit: [imageWidth - 20, availableHeight],
        x: imageX,
        y: topY,
        align: "center",
        valign: "center",
      });
    } catch (error) {
      console.error("Storybook image failed:", {
        url: image.url,
        error: error.message,
      });
    }
  }

  /*
   * Story text
   */

  doc.font(design.typography.bodyFont).fontSize(design.typography.bodySize);

  doc.text(chapter.content || "", textX + 15, topY + availableHeight * 0.2, {
    width: textWidth - 25,
    lineGap: design.typography.bodyLineGap,
    align: design.storySpread.textAlign,
  });
};

/*
|--------------------------------------------------------------------------
| Render ending
|--------------------------------------------------------------------------
*/

const renderEnding = ({ doc, design }) => {
  doc.addPage();

  doc.moveDown(10);

  doc
    .font(design.typography.headingFont)
    .fontSize(design.typography.headingSize)
    .text(design.ending.text, {
      align: "center",
    });
};

/*
|--------------------------------------------------------------------------
| Render back cover
|--------------------------------------------------------------------------
*/

const renderBackCover = ({ doc }) => {
  doc.addPage();

  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor("#777")
    .text("Created with Ebook Generator", {
      align: "center",
    });
};

/*
|--------------------------------------------------------------------------
| Main renderer
|--------------------------------------------------------------------------
*/

const renderStorybookPdf = async ({ doc, ebook, design, uploadsRoot }) => {
  await renderCover({
    doc,
    ebook,
    design,
    uploadsRoot,
  });

  renderTitlePage({
    doc,
    ebook,
    design,
  });

  /*
   * Storybook intentionally has no TOC.
   *
   * Each approved image becomes a visual story spread.
   */

  for (const chapter of ebook.assembly?.chapters || []) {
    const images = chapter.images || [];

    if (!images.length) {
      await renderStorySpread({
        doc,
        chapter,
        image: null,
        design,
        uploadsRoot,
      });

      continue;
    }

    for (const image of images) {
      await renderStorySpread({
        doc,
        chapter,
        image,
        design,
        uploadsRoot,
      });
    }
  }

  renderEnding({
    doc,
    design,
  });

  renderBackCover({
    doc,
  });
};

export default renderStorybookPdf;
