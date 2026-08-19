import Ebook from "../../models/Ebook.js";

import textGenerationService from "../openai/textGeneration.service.js";
import chapterSchema from "../../validators/chapter.validator.js";

const chapterGenerationSystemPrompt = `
You are an expert ebook writer.

Your task is to write one complete ebook chapter
from an approved ebook specification and an approved
chapter outline.

Return ONLY valid JSON.

Do not use markdown code fences.
Do not include explanations outside the JSON object.
Do not include comments.

The response MUST have exactly this structure:

{
  "chapterNumber": 1,
  "title": "Chapter title",
  "summary": "Short summary of the completed chapter.",
  "content": "The complete chapter content.",
  "wordCount": 800
}

STRICT TYPES:

- chapterNumber MUST be a JSON number.
- title MUST be a string.
- summary MUST be a string.
- content MUST be a string.
- wordCount MUST be a JSON number.

IMPORTANT:

- Write the actual chapter content.
- Do not return an outline.
- Do not return learning objectives as the chapter.
- Do not return key topics as the chapter.
- Do not invent unrelated topics.
- Follow the approved chapter purpose.
- Cover the approved key topics.
- Satisfy the approved learning objectives.
- Follow the ebook's tone and writing style.
- Follow the ebook's language.
- Follow the structural requirements.
- Follow the formatting requirements.
- Respect excluded topics.
- Include practical examples and exercises when required.
- Aim for the requested estimated word count.

The chapter should be coherent and read like part
of a finished professional ebook.

Return ONLY the JSON object.
`;

const buildChapterUserPrompt = ({ specification, chapter, authorName }) => `
Write the complete content for Chapter ${chapter.chapterNumber}.

Author:
${authorName || "Not specified"}

APPROVED EBOOK SPECIFICATION

Title:
${specification.title}

Subtitle:
${specification.subtitle}

Target audience:
${specification.targetAudience}

Objective:
${specification.objective}

Tone:
${specification.tone}

Writing style:
${specification.writingStyle}

Difficulty level:
${specification.difficultyLevel}

Language:
${specification.language}

Required topics:
${specification.requiredTopics.join(", ")}

Excluded topics:
${specification.excludedTopics.join(", ")}

Structural requirements:
${specification.structuralRequirements.join("\n")}

Formatting requirements:
${specification.formattingRequirements.join("\n")}

APPROVED CHAPTER OUTLINE

Chapter number:
${chapter.chapterNumber}

Chapter title:
${chapter.title}

Chapter purpose:
${chapter.purpose}

Chapter summary:
${chapter.summary}

Learning objectives:
${chapter.learningObjectives.join("\n")}

Key topics:
${chapter.keyTopics.join("\n")}

Estimated chapter word count:
${chapter.estimatedWordCount}

Image suggestions:
${JSON.stringify(chapter.imageSuggestions || [], null, 2)}

CHAPTER WRITING REQUIREMENTS

Write the actual chapter content.

Do not write an outline.

Do not merely repeat the chapter summary.

Cover the key topics naturally.

Achieve the learning objectives.

Follow the approved chapter purpose.

Use beginner-friendly explanations.

Use practical examples where appropriate.

Include the practical exercises described by the outline.

Follow the ebook's formatting requirements.

Do not introduce advanced topics that are excluded
by the specification.

Target approximately ${chapter.estimatedWordCount} words.

Return only the JSON object required by the system prompt.
`;

const generateChapters = async ({ ebookId, userId }) => {
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
      "Ebook specification must exist before generating chapters.",
    );

    error.statusCode = 400;

    throw error;
  }

  if (!ebook.specificationApproved) {
    const error = new Error(
      "Ebook specification must be approved before generating chapters.",
    );

    error.statusCode = 400;

    throw error;
  }

  if (!ebook.outline) {
    const error = new Error(
      "Ebook outline must exist before generating chapters.",
    );

    error.statusCode = 400;

    throw error;
  }

  if (
    ebook.generationProgress?.status !== "approved" ||
    ebook.generationProgress?.stage !== "outline"
  ) {
    const error = new Error(
      "Ebook outline must be approved before generating chapters.",
    );

    error.statusCode = 400;

    throw error;
  }

  const outlineChapters = ebook.outline.chapters || [];

  if (!outlineChapters.length) {
    const error = new Error("The ebook outline contains no chapters.");

    error.statusCode = 400;

    throw error;
  }

  ebook.status = "generating";

  ebook.generationProgress = {
    stage: "chapters",
    status: "generating",
    message: "Generating ebook chapters.",
    percentage: 50,
    updatedAt: new Date(),
  };

  ebook.chapters = outlineChapters.map((chapter) => ({
    chapterNumber: chapter.chapterNumber,
    title: chapter.title,
    summary: chapter.summary || "",
    content: "",
    wordCount: 0,
    status: "pending",
    generationProgress: null,
  }));

  ebook.chaptersApproved = false;

  await ebook.save();

  try {
    for (let index = 0; index < outlineChapters.length; index += 1) {
      const outlineChapter = outlineChapters[index];

      const chapter = ebook.chapters[index];

      chapter.status = "generating";

      ebook.generationProgress = {
        stage: "chapters",
        status: "generating",
        message: `Generating chapter ${index + 1} of ${outlineChapters.length}.`,
        percentage: Math.round(
          50 + ((index + 1) / outlineChapters.length) * 40,
        ),
        updatedAt: new Date(),
      };

      await ebook.save();

      const userPrompt = buildChapterUserPrompt({
        specification: ebook.specification,
        chapter: outlineChapter,
        authorName: ebook.authorName,
      });

      const generatedChapter =
        await textGenerationService.generateStructuredText({
          systemPrompt: chapterGenerationSystemPrompt,
          userPrompt,
        });

      const validatedChapter = chapterSchema.parse(generatedChapter);

      chapter.title = validatedChapter.title;

      chapter.summary = validatedChapter.summary;

      chapter.content = validatedChapter.content;

      chapter.wordCount = validatedChapter.wordCount;

      chapter.status = "generated";

      await ebook.save();
    }

    ebook.wordCount = ebook.chapters.reduce(
      (total, chapter) => total + chapter.wordCount,
      0,
    );

    ebook.status = "ready_for_review";

    ebook.generationProgress = {
      stage: "chapters",
      status: "completed",
      message: "Ebook chapters generated successfully.",
      percentage: 90,
      updatedAt: new Date(),
    };

    ebook.chaptersApproved = true;

    ebook.status = "completed";

    ebook.generationProgress = {
      stage: "chapters",
      status: "approved",
      message: "Ebook chapters approved.",
      percentage: 100,
      updatedAt: new Date(),
    };

    await ebook.save();

    return ebook;
  } catch (error) {
    ebook.status = "generating";

    ebook.generationProgress = {
      stage: "chapters",
      status: "failed",
      message: error?.message || "Failed to generate ebook chapters.",
      percentage: 0,
      updatedAt: new Date(),
    };

    await ebook.save();

    throw error;
  }
};

const approveChapters = async ({ ebookId, userId }) => {
  const ebook = await Ebook.findOne({
    _id: ebookId,
    userId,
  });

  if (!ebook) {
    const error = new Error("Ebook not found.");

    error.statusCode = 404;

    throw error;
  }

  if (!ebook.chapters?.length) {
    const error = new Error(
      "Generate the ebook chapters before approving them.",
    );

    error.statusCode = 400;

    throw error;
  }

  const hasIncompleteChapter = ebook.chapters.some(
    (chapter) => !chapter.content || chapter.status !== "generated",
  );

  if (hasIncompleteChapter) {
    const error = new Error("All chapters must be generated before approval.");

    error.statusCode = 400;

    throw error;
  }

  ebook.chapters.forEach((chapter) => {
    chapter.status = "approved";
  });

  ebook.chaptersApproved = true;

  ebook.status = "completed";

  ebook.generationProgress = {
    stage: "chapters",
    status: "approved",
    message: "Ebook chapters approved.",
    percentage: 100,
    updatedAt: new Date(),
  };

  await ebook.save();

  return ebook;
};

export default {
  generateChapters,
  approveChapters,
};
