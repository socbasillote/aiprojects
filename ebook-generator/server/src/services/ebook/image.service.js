import Ebook from "../../models/Ebook.js";

import textGenerationService from "../openai/textGeneration.service.js";

import imageSchema from "../../validators/image.validator.js";

const imagePlanningSystemPrompt = `
You are an expert ebook visual-content planner.

Create a practical image plan for an approved ebook.

Return ONLY valid JSON.

The response MUST have this structure:

{
  "images": [
    {
      "imageNumber": 1,
      "chapterNumber": 1,
      "type": "diagram",
      "title": "Image title",
      "description": "What the image should communicate.",
      "prompt": "Detailed image-generation prompt.",
      "altText": "Accessible description."
    }
  ]
}

IMPORTANT:

The "type" field MUST be exactly one of these values:

- "diagram"
- "illustration"
- "flowchart"
- "concept"
- "editorial"

Never use any other value.

Rules:

- Only create images that materially improve the ebook.
- Use the approved image requirements as the primary source.
- Do not introduce unrelated visual content.
- chapterNumber must correspond to an existing chapter.
- Use simple, educational visuals when appropriate.
- Prompts must be suitable for an image-generation model.
- Avoid text-heavy images unless the image specifically requires
  labels or a diagram.
- Alt text must clearly describe the intended visual.
- Return only JSON.
`;

const buildImagePlanningPrompt = ({ specification, chapters }) => `
Create the image plan for this approved ebook.

EBOOK SPECIFICATION

Title:
${specification.title}

Target audience:
${specification.targetAudience}

Objective:
${specification.objective}

Language:
${specification.language}

Formatting requirements:
${specification.formattingRequirements.join("\n")}

Image requirements:
${specification.imageRequirements.join("\n")}

APPROVED CHAPTERS

${chapters
  .map(
    (chapter) => `
Chapter ${chapter.chapterNumber}
Title: ${chapter.title}
Summary: ${chapter.summary}
`,
  )
  .join("\n")}

Create the image plan now.
`;

const generateImagePlan = async ({ ebookId, userId }) => {
  const ebook = await Ebook.findOne({
    _id: ebookId,
    userId,
  });

  if (!ebook) {
    const error = new Error("Ebook not found.");

    error.statusCode = 404;

    throw error;
  }

  if (!ebook.chaptersApproved) {
    const error = new Error(
      "Ebook chapters must be approved before generating images.",
    );

    error.statusCode = 400;

    throw error;
  }

  if (!ebook.chapters?.length) {
    const error = new Error(
      "Ebook chapters are required before generating images.",
    );

    error.statusCode = 400;

    throw error;
  }

  const userPrompt = buildImagePlanningPrompt({
    specification: ebook.specification,
    chapters: ebook.chapters,
  });

  ebook.status = "generating";

  ebook.generationProgress = {
    stage: "images",
    status: "planning",
    message: "Creating ebook image plan.",
    percentage: 70,
    updatedAt: new Date(),
  };

  await ebook.save();

  try {
    const generated = await textGenerationService.generateStructuredText({
      systemPrompt: imagePlanningSystemPrompt,
      userPrompt,
    });

    if (!generated || !Array.isArray(generated.images)) {
      throw new Error("OpenAI returned an invalid image plan.");
    }

    const images = generated.images.map((image, index) => {
      const result = imageSchema.safeParse(image);

      if (!result.success) {
        const error = new Error(
          `Invalid image ${index + 1}: ${result.error.message}`,
        );

        error.statusCode = 400;

        throw error;
      }

      return result.data;
    });

    ebook.images = images.map((image) => ({
      ...image,
      status: "pending",
      url: "",
    }));

    ebook.imagesApproved = false;

    ebook.generationProgress = {
      stage: "images",
      status: "planned",
      message: "Ebook image plan generated.",
      percentage: 75,
      updatedAt: new Date(),
    };

    await ebook.save();

    return ebook;
  } catch (error) {
    ebook.status = "error";

    ebook.generationProgress = {
      stage: "images",
      status: "failed",
      message: error?.message || "Failed to generate image plan.",
      percentage: 0,
      updatedAt: new Date(),
    };

    await ebook.save();

    throw error;
  }
};

const approveImagePlan = async ({ ebookId, userId }) => {
  const ebook = await Ebook.findOne({
    _id: ebookId,
    userId,
  });

  if (!ebook) {
    const error = new Error("Ebook not found.");

    error.statusCode = 404;

    throw error;
  }

  if (!ebook.images?.length) {
    const error = new Error("Generate the image plan before approving it.");

    error.statusCode = 400;

    throw error;
  }

  ebook.images.forEach((image) => {
    image.status = "approved";
  });

  ebook.imagesApproved = true;

  ebook.status = "outline_ready";

  ebook.generationProgress = {
    stage: "images",
    status: "approved",
    message: "Ebook image plan approved.",
    percentage: 80,
    updatedAt: new Date(),
  };

  await ebook.save();

  return ebook;
};

export default {
  generateImagePlan,
  approveImagePlan,
};
