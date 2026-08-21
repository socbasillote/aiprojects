import Ebook from "../../models/Ebook.js";

import pdfExportService from "../export/pdfExport.service.js";

const exportPdf = async ({ ebookId, userId }) => {
  /*
   * Always fetch a fresh document from MongoDB.
   */
  const ebook = await Ebook.findOne({
    _id: ebookId,
    userId,
  });

  if (!ebook) {
    const error = new Error("Ebook not found.");
    error.statusCode = 404;
    throw error;
  }

  if (ebook.status !== "ready_for_export") {
    const error = new Error(
      "The ebook must be approved before it can be exported.",
    );

    error.statusCode = 400;
    throw error;
  }

  if (ebook.assembly?.status !== "approved") {
    const error = new Error(
      "The ebook assembly must be approved before exporting.",
    );

    error.statusCode = 400;
    throw error;
  }

  /*
   * Verify the assembly before starting export.
   */
  const chapters = ebook.assembly.chapters || [];

  if (!chapters.length) {
    const error = new Error("The ebook assembly contains no chapters.");

    error.statusCode = 400;
    throw error;
  }

  const assembledImageCount = chapters.reduce(
    (total, chapter) => total + (chapter.images?.length || 0),
    0,
  );

  const sourceImageCount = (ebook.images || []).filter(
    (image) =>
      (image.status === "generated" || image.status === "approved") &&
      image.chapterNumber !== null &&
      image.chapterNumber !== undefined,
  ).length;

  const totalImages = Math.max(assembledImageCount, sourceImageCount);

  console.log("======================================");
  console.log("PDF EXPORT SERVICE");
  console.log("EBOOK:", ebook._id);
  console.log("STATUS:", ebook.status);
  console.log("ASSEMBLY STATUS:", ebook.assembly.status);
  console.log("CHAPTER COUNT:", chapters.length);
  console.log("TOTAL ASSEMBLED IMAGES:", totalImages);
  console.log("======================================");

  chapters.forEach((chapter) => {
    console.log("EXPORT CHAPTER:", {
      chapterNumber: chapter.chapterNumber,
      title: chapter.title,
      imageCount: chapter.images?.length || 0,
      images: chapter.images || [],
    });
  });

  /*
   * Do not export an assembly that lost
   * its images unexpectedly.
   *
   * Your current ebook has 13 images, so this
   * protects against accidentally exporting an
   * empty assembly.
   */
  if (totalImages === 0 && ebook.images?.length > 0) {
    const error = new Error(
      "The assembled ebook contains no images even though approved ebook images exist. Re-assemble the ebook before exporting.",
    );

    error.statusCode = 400;

    throw error;
  }

  /*
   * Mark export as active.
   */
  ebook.status = "exporting";

  ebook.export.status = "exporting";

  ebook.export.pdf.status = "generating";
  ebook.export.pdf.errorMessage = "";

  ebook.generationProgress = {
    stage: "export",
    status: "generating",
    message: "Generating PDF.",
    percentage: 10,
    updatedAt: new Date(),
  };

  await ebook.save();

  try {
    /*
     * IMPORTANT:
     *
     * Pass the complete fresh ebook document.
     * pdfExportService.createPdf() will read:
     *
     * ebook.assembly.chapters[].images
     */
    const pdfUrl = await pdfExportService.createPdf({
      ebook,
    });

    if (!pdfUrl) {
      throw new Error("PDF generation returned no file URL.");
    }

    ebook.export.pdf.status = "ready";
    ebook.export.pdf.url = pdfUrl;
    ebook.export.pdf.generatedAt = new Date();
    ebook.export.pdf.errorMessage = "";

    /*
     * PDF is ready.
     *
     * EPUB may still need to be generated.
     */
    ebook.export.status = "ready";

    ebook.status = "ready_for_export";

    ebook.generationProgress = {
      stage: "export",
      status: "ready_for_export",
      message: "PDF generated successfully.",
      percentage: 100,
      updatedAt: new Date(),
    };

    await ebook.save();

    console.log("PDF EXPORT COMPLETE:", {
      ebookId: ebook._id,
      pdfUrl,
      totalImages,
    });

    return ebook;
  } catch (error) {
    console.error("PDF EXPORT ERROR:", error);

    ebook.export.pdf.status = "error";
    ebook.export.pdf.errorMessage = error?.message || "PDF generation failed.";

    ebook.export.status = "error";

    ebook.status = "error";

    ebook.generationProgress = {
      stage: "export",
      status: "failed",
      message: error?.message || "PDF generation failed.",
      percentage: 0,
      updatedAt: new Date(),
    };

    await ebook.save();

    throw error;
  }
};

const exportEpub = async ({ ebookId, userId }) => {
  const ebook = await Ebook.findOne({
    _id: ebookId,
    userId,
  });

  if (!ebook) {
    const error = new Error("Ebook not found.");
    error.statusCode = 404;
    throw error;
  }

  if (ebook.status !== "ready_for_export") {
    const error = new Error(
      "The ebook must be approved before it can be exported.",
    );

    error.statusCode = 400;
    throw error;
  }

  if (!ebook.assembly || ebook.assembly.status !== "approved") {
    const error = new Error(
      "The ebook assembly must be approved before exporting.",
    );

    error.statusCode = 400;
    throw error;
  }

  ebook.status = "exporting";

  ebook.export.status = "exporting";

  ebook.export.epub.status = "generating";
  ebook.export.epub.errorMessage = "";

  ebook.generationProgress = {
    stage: "export",
    status: "generating",
    message: "Preparing EPUB export.",
    percentage: 0,
    updatedAt: new Date(),
  };

  await ebook.save();

  /*
   * EPUB generation will be implemented next.
   */

  return ebook;
};

const getExportStatus = async ({ ebookId, userId }) => {
  const ebook = await Ebook.findOne({
    _id: ebookId,
    userId,
  });

  if (!ebook) {
    const error = new Error("Ebook not found.");
    error.statusCode = 404;
    throw error;
  }

  return ebook;
};

export default {
  exportPdf,
  exportEpub,
  getExportStatus,
};
