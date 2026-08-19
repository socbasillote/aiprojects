import Ebook from "../../models/Ebook.js";

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
     * Sort chapters to guarantee correct order.
     */
    const chapters = [...ebook.chapters].sort(
      (a, b) => a.chapterNumber - b.chapterNumber,
    );

    const tableOfContents = chapters.map((chapter) => ({
      chapterNumber: chapter.chapterNumber,
      title: chapter.title,
    }));

    /*
     * Build the final chapter representation.
     */
    const assembledChapters = chapters.map((chapter) => {
      const chapterImages = ebook.images
        .filter(
          (image) =>
            image.chapterNumber === chapter.chapterNumber &&
            image.status === "approved",
        )
        .map((image) => ({
          imageNumber: image.imageNumber,
          title: image.title,
          url: image.url,
          altText: image.altText,
          type: image.type,
        }));

      return {
        chapterNumber: chapter.chapterNumber,
        title: chapter.title,
        summary: chapter.summary || "",
        content: chapter.content || "",
        wordCount: chapter.wordCount || 0,
        images: chapterImages,
      };
    });

    const wordCount = assembledChapters.reduce(
      (total, chapter) => total + (chapter.wordCount || 0),
      0,
    );

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

    return ebook;
  } catch (error) {
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

  ebook.assembly.status = "approved";
  ebook.assembly.approvedAt = new Date();

  ebook.status = "completed";

  ebook.generationProgress = {
    stage: "assembly",
    status: "approved",
    message: "Ebook assembly approved. Ebook is complete.",
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
