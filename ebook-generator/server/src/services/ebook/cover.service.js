import Ebook from "../../models/Ebook.js";

import imageGenerationService from "../openai/imageGeneration.service.js";

import imageStorage from "../../utils/imageStorage.js";

const buildCoverPrompt = ({
  title,
  subtitle,
  authorName,
  description,
  targetAudience,
  tone,
  writingStyle,
}) => `
Create a professional ebook cover background for the following book.

BOOK INFORMATION

Title:
${title}

Subtitle:
${subtitle || "None"}

Author:
${authorName || "None"}

Description:
${description}

Target audience:
${targetAudience || "General readers"}

Tone:
${tone || "Professional"}

Writing style:
${writingStyle || "Clear and practical"}

COVER DIRECTION

Create a polished, professional ebook cover composition
that visually communicates the subject of the book.

The design should:

- Look professional and commercially usable.
- Match the book's subject and target audience.
- Use strong visual hierarchy.
- Leave clear negative space for title and author typography.
- Avoid excessive visual clutter.
- Avoid watermarks.
- Avoid logos or unrelated branding.
- Avoid small unreadable text.
- Do NOT attempt to render the book title, subtitle,
  or author name as typography in the image.
- The final application will add the typography separately.

Create the cover artwork only.
`;

const generateCover = async ({ ebookId, userId }) => {
  const ebook = await Ebook.findOne({
    _id: ebookId,
    userId,
  });

  if (!ebook) {
    const error = new Error("Ebook not found.");
    error.statusCode = 404;
    throw error;
  }

  if (!ebook.imagesApproved) {
    const error = new Error(
      "Ebook images must be approved before generating the cover.",
    );

    error.statusCode = 400;
    throw error;
  }

  if (!ebook.images?.length) {
    const error = new Error(
      "Ebook images are required before generating the cover.",
    );

    error.statusCode = 400;
    throw error;
  }

  const prompt = buildCoverPrompt({
    title: ebook.title,
    subtitle: ebook.subtitle,
    authorName: ebook.authorName,
    description: ebook.description,
    targetAudience:
      ebook.specification?.targetAudience || ebook.settings?.targetAudience,
    tone: ebook.specification?.tone || ebook.settings?.tone,
    writingStyle:
      ebook.specification?.writingStyle || ebook.settings?.writingStyle,
  });

  /*
   * Mark the cover generation as active.
   */
  ebook.status = "generating";

  ebook.cover = {
    status: "generating",
    url: "",
    prompt,
    altText: `Cover artwork for ${ebook.title}.`,
    errorMessage: "",
  };

  /*
   * cover is a Mixed field.
   * Explicitly tell Mongoose it changed.
   */
  ebook.markModified("cover");

  ebook.generationProgress = {
    stage: "cover",
    status: "generating",
    message: "Generating ebook cover.",
    percentage: 95,
    updatedAt: new Date(),
  };

  await ebook.save();

  try {
    const generated = await imageGenerationService.generateImage({
      prompt,
    });

    console.log("COVER IMAGE GENERATION RESULT:", {
      type: generated?.type,
      hasValue: Boolean(generated?.value),
    });

    let coverUrl = "";

    /*
     * Base64 image returned by OpenAI.
     */
    if (generated?.type === "base64" && generated?.value) {
      coverUrl = await imageStorage.saveBase64Image({
        ebookId: ebook._id,
        imageNumber: "cover",
        base64: generated.value,
      });
    } else if (generated?.type === "url" && generated?.value) {
      /*
       * Hosted image URL returned by OpenAI.
       */
      coverUrl = await imageStorage.saveImageFromUrl({
        ebookId: ebook._id,
        imageNumber: "cover",
        url: generated.value,
      });
    }

    if (!coverUrl) {
      throw new Error("Cover generation returned no usable image data.");
    }

    console.log("COVER LOCAL URL:", coverUrl);

    /*
     * IMPORTANT:
     *
     * Replace the entire Mixed object instead of
     * mutating ebook.cover.status / ebook.cover.url.
     */
    ebook.cover = {
      status: "generated",
      url: coverUrl,
      prompt,
      altText: `Cover artwork for ${ebook.title}.`,
      errorMessage: "",
    };

    /*
     * Explicitly mark Mixed field as modified.
     */
    ebook.markModified("cover");

    ebook.status = "ready_for_review";

    ebook.generationProgress = {
      stage: "cover",
      status: "completed",
      message: "Ebook cover generated successfully.",
      percentage: 98,
      updatedAt: new Date(),
    };

    await ebook.save();

    /*
     * Read the ebook again from MongoDB.
     *
     * This guarantees that what we return to the frontend
     * is the actual persisted state.
     */
    const savedEbook = await Ebook.findOne({
      _id: ebook._id,
      userId,
    });

    if (!savedEbook) {
      throw new Error("Cover generated, but the ebook could not be reloaded.");
    }

    console.log("COVER SAVED TO DATABASE:", {
      ebookStatus: savedEbook.status,
      coverStatus: savedEbook.cover?.status,
      coverUrl: savedEbook.cover?.url,
      progressStatus: savedEbook.generationProgress?.status,
    });

    return savedEbook;
  } catch (error) {
    console.error("COVER GENERATION ERROR:", error);

    /*
     * Replace the entire Mixed object on failure too.
     */
    ebook.cover = {
      status: "error",
      url: "",
      prompt,
      altText: `Cover artwork for ${ebook.title}.`,
      errorMessage: error?.message || "Cover generation failed.",
    };

    ebook.markModified("cover");

    ebook.status = "error";

    ebook.generationProgress = {
      stage: "cover",
      status: "failed",
      message: error?.message || "Failed to generate ebook cover.",
      percentage: 0,
      updatedAt: new Date(),
    };

    await ebook.save();

    throw error;
  }
};

const approveCover = async ({ ebookId, userId }) => {
  const ebook = await Ebook.findOne({
    _id: ebookId,
    userId,
  });

  if (!ebook) {
    const error = new Error("Ebook not found.");
    error.statusCode = 404;
    throw error;
  }

  if (!ebook.cover?.url) {
    const error = new Error("Generate the ebook cover before approving it.");

    error.statusCode = 400;
    throw error;
  }

  if (ebook.cover.status !== "generated") {
    const error = new Error("The ebook cover is not ready for approval.");

    error.statusCode = 400;
    throw error;
  }

  /*
   * Replace the entire Mixed object.
   */
  ebook.cover = {
    ...ebook.cover,
    status: "approved",
    errorMessage: "",
  };

  ebook.markModified("cover");

  ebook.status = "ready_for_review";

  ebook.generationProgress = {
    stage: "cover",
    status: "approved",
    message: "Ebook cover approved. Ready for final assembly.",
    percentage: 100,
    updatedAt: new Date(),
  };

  await ebook.save();

  /*
   * Return the persisted document.
   */
  const savedEbook = await Ebook.findOne({
    _id: ebook._id,
    userId,
  });

  return savedEbook;
};

export default {
  generateCover,
  approveCover,
};
