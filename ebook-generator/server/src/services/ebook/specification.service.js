import Ebook from "../../models/Ebook.js";

import specificationSchema from "../../validators/specification.validator.js";

import {
  specificationSystemPrompt,
  buildSpecificationUserPrompt,
} from "../../prompts/specification.prompt.js";

import textGenerationService from "../openai/textGeneration.service.js";

const generateSpecification = async ({ ebookId, userId }) => {
  const ebook = await Ebook.findOne({
    _id: ebookId,
    userId,
  });

  if (!ebook) {
    const error = new Error("Ebook not found.");

    error.statusCode = 404;

    throw error;
  }

  const userPrompt = buildSpecificationUserPrompt({
    title: ebook.title,
    subtitle: ebook.subtitle,
    description: ebook.description,
    targetAudience: ebook.settings?.targetAudience,
    language: ebook.settings?.language,
    tone: ebook.settings?.tone,
    ebookLength: ebook.settings?.ebookLength,
    chapterCount: ebook.settings?.chapterCount,
    writingStyle: ebook.settings?.writingStyle,
    contentType: ebook.settings?.contentType,
    authorName: ebook.authorName,
  });

  /*
   * Mark generation as running before
   * sending the request to OpenAI.
   */
  ebook.status = "planning";

  ebook.generationProgress = {
    stage: "specification",
    status: "generating",
    message: "Generating ebook specification...",
    percentage: 10,
    updatedAt: new Date(),
  };

  await ebook.save();

  try {
    const generatedSpecification =
      await textGenerationService.generateStructuredText({
        systemPrompt: specificationSystemPrompt,

        userPrompt,
      });

    /*
     * Never save the AI response directly.
     * Validate it first.
     */
    const specification = specificationSchema.parse(generatedSpecification);

    /*
     * The generated specification is a
     * new version, therefore it cannot
     * remain approved from an older version.
     */
    ebook.specification = specification;

    ebook.specificationApproved = false;

    /*
     * The specification becomes the
     * authoritative planning data for
     * these fields.
     */
    ebook.title = specification.title;

    ebook.subtitle = specification.subtitle ?? "";

    ebook.chapterCount = specification.chapterCount;

    ebook.status = "planning";

    ebook.generationProgress = {
      stage: "specification",
      status: "completed",
      message: "Ebook specification generated.",
      percentage: 20,
      updatedAt: new Date(),
    };

    await ebook.save();

    return ebook;
  } catch (error) {
    /*
     * Do not delete or overwrite an
     * existing valid specification when
     * regeneration fails.
     */
    ebook.status = "error";

    ebook.generationProgress = {
      stage: "specification",
      status: "failed",
      message: error?.message || "Failed to generate ebook specification.",
      percentage: 0,
      updatedAt: new Date(),
    };

    await ebook.save();

    throw error;
  }
};

const updateSpecification = async ({ ebookId, userId, specification }) => {
  const ebook = await Ebook.findOne({
    _id: ebookId,
    userId,
  });

  if (!ebook) {
    const error = new Error("Ebook not found.");

    error.statusCode = 404;

    throw error;
  }

  /*
   * Validate the entire edited
   * specification before changing
   * anything on the ebook.
   */
  const validatedSpecification = specificationSchema.parse(specification);

  ebook.specification = validatedSpecification;

  ebook.title = validatedSpecification.title;

  ebook.subtitle = validatedSpecification.subtitle ?? "";

  ebook.chapterCount = validatedSpecification.chapterCount;

  /*
   * Editing an approved specification
   * invalidates that approval.
   */
  ebook.specificationApproved = false;

  ebook.status = "planning";

  ebook.generationProgress = {
    stage: "specification",
    status: "edited",
    message:
      "Ebook specification updated. Approval is required before generating the outline.",
    percentage: 25,
    updatedAt: new Date(),
  };

  await ebook.save();

  return ebook;
};

const approveSpecification = async ({ ebookId, userId }) => {
  const ebook = await Ebook.findOne({
    _id: ebookId,
    userId,
  });

  if (!ebook) {
    const error = new Error("Ebook not found.");

    error.statusCode = 404;

    throw error;
  }

  if (!ebook.specification) {
    const error = new Error(
      "Generate an ebook specification before approving it.",
    );

    error.statusCode = 400;

    throw error;
  }

  ebook.specificationApproved = true;

  ebook.status = "planning";

  ebook.generationProgress = {
    stage: "specification",
    status: "approved",
    message: "Ebook specification approved.",
    percentage: 25,
    updatedAt: new Date(),
  };

  await ebook.save();

  return ebook;
};

export default {
  generateSpecification,
  updateSpecification,
  approveSpecification,
};
