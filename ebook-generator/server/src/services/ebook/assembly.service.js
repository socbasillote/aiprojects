import Ebook from "../../models/Ebook.js";

import { getDesign, isChildrenDesign } from "../design/designRegistry.js";

const generateAssembly = async ({ ebookId, userId }) => {
  const ebook = await Ebook.findOne({
    _id: ebookId,
    userId,
  });

  if (!ebook) {
    const error = new Error("Ebook not found.");
    error.statusCode = 404;
    throw error;
  }

  if (!ebook.specificationApproved) {
    const error = new Error(
      "Ebook specification must be approved before assembly.",
    );

    error.statusCode = 400;
    throw error;
  }

  if (!ebook.chaptersApproved) {
    const error = new Error("Ebook chapters must be approved before assembly.");

    error.statusCode = 400;
    throw error;
  }

  if (!ebook.imagesApproved) {
    const error = new Error("Ebook images must be approved before assembly.");

    error.statusCode = 400;
    throw error;
  }

  if (!ebook.cover || ebook.cover.status !== "approved") {
    const error = new Error("Ebook cover must be approved before assembly.");

    error.statusCode = 400;
    throw error;
  }

  if (!ebook.chapters?.length) {
    const error = new Error("Ebook chapters are required.");

    error.statusCode = 400;

    throw error;
  }

  /*
   * Mark assembly as active.
   */
  ebook.assembly = {
    status: "assembling",
    title: ebook.title,
    subtitle: ebook.subtitle || "",
    authorName: ebook.authorName || "",
    coverUrl: ebook.cover.url || "",
    tableOfContents: [],
    chapters: [],
    wordCount: 0,
    chapterCount: 0,
    assembledAt: null,
    approvedAt: null,
    errorMessage: "",
  };

  /*
   * The previous PDF belongs to the old assembly.
   * It must not remain downloadable after rebuilding.
   */
  ebook.export.status = "pending";
  ebook.export.pdf.status = "pending";
  ebook.export.pdf.url = "";
  ebook.export.pdf.errorMessage = "";
  ebook.export.pdf.generatedAt = null;

  ebook.status = "generating";

  ebook.generationProgress = {
    stage: "assembly",
    status: "assembling",
    message: "Assembling the final ebook.",
    percentage: 95,
    updatedAt: new Date(),
  };

  await ebook.save();

  try {
    /*
     * Sort chapters into their final order.
     */
    const chapters = [...ebook.chapters].sort(
      (a, b) => a.chapterNumber - b.chapterNumber,
    );

    /*
     * Build table of contents.
     */
    const tableOfContents = chapters.map((chapter) => ({
      chapterNumber: chapter.chapterNumber,
      title: chapter.title,
    }));

    /*
     * Build final chapter representation.
     *
     * IMPORTANT:
     * Images are taken from ebook.images and attached
     * to the matching chapter.
     */
    const assembledChapters = chapters.map((chapter) => {
      const chapterNumber = Number(chapter.chapterNumber);

      const chapterImages = (ebook.images || [])
        .filter((image) => {
          const imageChapterNumber =
            image.chapterNumber === null || image.chapterNumber === undefined
              ? null
              : Number(image.chapterNumber);

          const validStatus =
            image.status === "generated" || image.status === "approved";

          return (
            imageChapterNumber === chapterNumber &&
            validStatus &&
            Boolean(image.url)
          );
        })
        .sort((a, b) => Number(a.imageNumber || 0) - Number(b.imageNumber || 0))
        .map((image) => ({
          imageNumber: Number(image.imageNumber),
          title: image.title || "",
          url: image.url || "",
          altText: image.altText || "",
          type: image.type || "editorial",
        }));

      console.log(`ASSEMBLY CHAPTER ${chapterNumber}:`, {
        title: chapter.title,
        imageCount: chapterImages.length,
        images: chapterImages,
      });

      const templateId = ebook.design?.templateId || "custom";

      const design = getDesign(templateId);

      return {
        chapterNumber,
        title: chapter.title,
        summary: chapter.summary || "",
        content: chapter.content || "",
        wordCount: Number(chapter.wordCount || 0),
        images: chapterImages,
      };
    });

    /*
     * Calculate total word count.
     */
    const wordCount = assembledChapters.reduce(
      (total, chapter) => total + Number(chapter.wordCount || 0),
      0,
    );

    /*
     * Calculate total image count for debugging/verification.
     */
    const imageCount = assembledChapters.reduce(
      (total, chapter) => total + (chapter.images?.length || 0),
      0,
    );

    /*
     * Save final assembly.
     */
    ebook.assembly = {
      status: "ready_for_review",
      title: ebook.title,
      subtitle: ebook.subtitle || "",
      authorName: ebook.authorName || "",
      coverUrl: ebook.cover.url || "",
      tableOfContents,
      chapters: assembledChapters,
      wordCount,
      chapterCount: assembledChapters.length,
      imageCount,
      assembledAt: new Date(),
      approvedAt: null,
      errorMessage: "",
    };

    ebook.status = "ready_for_review";

    ebook.generationProgress = {
      stage: "assembly",
      status: "completed",
      message: "Ebook assembled successfully and ready for review.",
      percentage: 98,
      updatedAt: new Date(),
    };

    await ebook.save();

    /*
     * Read the document back from MongoDB.
     *
     * This verifies that the assembly, including
     * chapter images, was actually persisted.
     */
    const savedEbook = await Ebook.findOne({
      _id: ebook._id,
      userId,
    });

    console.log("ASSEMBLY SAVED:", {
      status: savedEbook.status,
      assemblyStatus: savedEbook.assembly?.status,
      chapterCount: savedEbook.assembly?.chapters?.length || 0,
      imageCount: savedEbook.assembly?.imageCount || 0,
      chapters: savedEbook.assembly?.chapters?.map((chapter) => ({
        chapterNumber: chapter.chapterNumber,
        title: chapter.title,
        imageCount: chapter.images?.length || 0,
        images: chapter.images,
      })),
    });

    return savedEbook;
  } catch (error) {
    console.error("ASSEMBLY GENERATION ERROR:", error);

    ebook.assembly.status = "error";
    ebook.assembly.errorMessage = error?.message || "Ebook assembly failed.";

    ebook.status = "error";

    ebook.generationProgress = {
      stage: "assembly",
      status: "failed",
      message: error?.message || "Ebook assembly failed.",
      percentage: 0,
      updatedAt: new Date(),
    };

    await ebook.save();

    throw error;
  }
};

const approveAssembly = async ({ ebookId, userId }) => {
  const ebook = await Ebook.findOne({
    _id: ebookId,
    userId,
  });

  if (!ebook) {
    const error = new Error("Ebook not found.");

    error.statusCode = 404;

    throw error;
  }

  if (!ebook.assembly) {
    const error = new Error("Assemble the ebook before approving it.");

    error.statusCode = 400;

    throw error;
  }

  if (ebook.assembly.status !== "ready_for_review") {
    const error = new Error("The assembled ebook is not ready for approval.");

    error.statusCode = 400;

    throw error;
  }

  /*
   * Make sure the assembly actually contains
   * the expected chapters.
   */
  if (!ebook.assembly.chapters?.length) {
    const error = new Error("The ebook assembly contains no chapters.");

    error.statusCode = 400;

    throw error;
  }

  /*
   * Make sure every chapter has content.
   */
  const emptyChapter = ebook.assembly.chapters.find(
    (chapter) => !chapter.content?.trim(),
  );

  if (emptyChapter) {
    const error = new Error(
      `Chapter ${emptyChapter.chapterNumber} has no content.`,
    );

    error.statusCode = 400;

    throw error;
  }

  ebook.assembly.status = "approved";
  ebook.assembly.approvedAt = new Date();

  ebook.status = "ready_for_export";

  ebook.generationProgress = {
    stage: "assembly",
    status: "approved",
    message: "Ebook assembly approved. Ready for export.",
    percentage: 100,
    updatedAt: new Date(),
  };

  await ebook.save();

  return ebook;
};

export default {
  generateAssembly,
  approveAssembly,
};
