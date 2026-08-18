import Ebook from "../../models/Ebook.js";

import outlineSchema from "../../validators/outline.validator.js";
import outlineChapterSchema from "../../validators/outlineChapter.validator.js";

import {
  outlineSystemPrompt,
  buildOutlineUserPrompt,
} from "../../prompts/outline.prompt.js";

import textGenerationService from "../openai/textGeneration.service.js";

const generateOutline = async ({ ebookId, userId }) => {
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
      "Ebook specification must be created before generating an outline.",
    );

    error.statusCode = 400;

    throw error;
  }

  if (!ebook.specificationApproved) {
    const error = new Error(
      "Ebook specification must be approved before generating an outline.",
    );

    error.statusCode = 400;

    throw error;
  }

  ebook.status = "planning";

  ebook.generationProgress = {
    stage: "outline",
    status: "generating",
    message: "Generating ebook outline.",
    percentage: 30,
    updatedAt: new Date(),
  };

  await ebook.save();

  try {
    const userPrompt = buildOutlineUserPrompt({
      originalPrompt: ebook.originalPrompt,
      specification: ebook.specification,
    });

    const generatedOutline = await textGenerationService.generateStructuredText(
      {
        systemPrompt: outlineSystemPrompt,
        userPrompt,
      },
    );

    const outline = outlineSchema.parse(generatedOutline);

    ebook.outline = outline;

    ebook.status = "outline_ready";

    ebook.generationProgress = {
      stage: "outline",
      status: "completed",
      message: "Ebook outline generated.",
      percentage: 40,
      updatedAt: new Date(),
    };

    await ebook.save();

    return ebook;
  } catch (error) {
    ebook.status = "error";

    ebook.generationProgress = {
      stage: "outline",
      status: "failed",
      message: error.message,
      percentage: 0,
      updatedAt: new Date(),
    };

    await ebook.save();

    throw error;
  }
};

const updateOutline = async ({ ebookId, userId, outline }) => {
  const ebook = await Ebook.findOne({
    _id: ebookId,
    userId,
  });

  if (!ebook) {
    const error = new Error("Ebook not found.");

    error.statusCode = 404;

    throw error;
  }

  const validatedOutline = outlineSchema.parse(outline);

  ebook.outline = validatedOutline;

  ebook.status = "outline_ready";

  ebook.generationProgress = {
    stage: "outline",
    status: "edited",
    message: "Ebook outline updated.",
    percentage: 45,
    updatedAt: new Date(),
  };

  await ebook.save();

  return ebook;
};

const approveOutline = async ({ ebookId, userId }) => {
  const ebook = await Ebook.findOne({
    _id: ebookId,
    userId,
  });

  if (!ebook) {
    const error = new Error("Ebook not found.");

    error.statusCode = 404;

    throw error;
  }

  if (!ebook.outline?.chapters?.length) {
    const error = new Error("An outline must exist before it can be approved.");

    error.statusCode = 400;

    throw error;
  }

  ebook.status = "outline_ready";

  ebook.generationProgress = {
    stage: "outline",
    status: "approved",
    message: "Ebook outline approved.",
    percentage: 50,
    updatedAt: new Date(),
  };

  await ebook.save();

  return ebook;
};

const updateOutlineChapter = async ({
  ebookId,
  userId,
  chapterNumber,
  chapter,
}) => {
  const ebook = await Ebook.findOne({
    _id: ebookId,
    userId,
  });

  if (!ebook) {
    const error = new Error("Ebook not found.");

    error.statusCode = 404;

    throw error;
  }

  if (!ebook.outline?.chapters?.length) {
    const error = new Error("Ebook outline does not exist.");

    error.statusCode = 400;

    throw error;
  }

  const validatedChapter = outlineChapterSchema.parse(chapter);

  const chapterIndex = ebook.outline.chapters.findIndex(
    (item) => item.chapterNumber === chapterNumber,
  );

  if (chapterIndex === -1) {
    const error = new Error("Outline chapter not found.");

    error.statusCode = 404;

    throw error;
  }

  ebook.outline.chapters[chapterIndex] = validatedChapter;

  ebook.status = "outline_ready";

  await ebook.save();

  return ebook;
};

const addOutlineChapter = async ({ ebookId, userId, chapter }) => {
  const ebook = await Ebook.findOne({
    _id: ebookId,
    userId,
  });

  if (!ebook) {
    const error = new Error("Ebook not found.");

    error.statusCode = 404;

    throw error;
  }

  const validatedChapter = outlineChapterSchema.parse(chapter);

  if (!ebook.outline) {
    ebook.outline = {
      chapters: [],
    };
  }

  const chapters = ebook.outline.chapters || [];

  const nextChapterNumber =
    chapters.length === 0
      ? 1
      : Math.max(...chapters.map((item) => item.chapterNumber)) + 1;

  const chapterToAdd = {
    ...validatedChapter,
    chapterNumber: nextChapterNumber,
  };

  chapters.push(chapterToAdd);

  ebook.outline.chapters = chapters;

  ebook.chapterCount = chapters.length;

  ebook.status = "outline_ready";

  await ebook.save();

  return ebook;
};

const deleteOutlineChapter = async ({ ebookId, userId, chapterNumber }) => {
  const ebook = await Ebook.findOne({
    _id: ebookId,
    userId,
  });

  if (!ebook) {
    const error = new Error("Ebook not found.");

    error.statusCode = 404;

    throw error;
  }

  const chapters = ebook.outline?.chapters || [];

  if (chapters.length <= 1) {
    const error = new Error(
      "An ebook outline must contain at least one chapter.",
    );

    error.statusCode = 400;

    throw error;
  }

  const filteredChapters = chapters.filter(
    (chapter) => chapter.chapterNumber !== chapterNumber,
  );

  if (filteredChapters.length === chapters.length) {
    const error = new Error("Outline chapter not found.");

    error.statusCode = 404;

    throw error;
  }

  const normalizedChapters = filteredChapters.map((chapter, index) => ({
    ...chapter.toObject?.(),
    chapterNumber: index + 1,
  }));

  ebook.outline.chapters = normalizedChapters;

  ebook.chapterCount = normalizedChapters.length;

  ebook.status = "outline_ready";

  await ebook.save();

  return ebook;
};

const reorderOutlineChapters = async ({ ebookId, userId, chapterOrder }) => {
  const ebook = await Ebook.findOne({
    _id: ebookId,
    userId,
  });

  if (!ebook) {
    const error = new Error("Ebook not found.");

    error.statusCode = 404;

    throw error;
  }

  const chapters = ebook.outline?.chapters || [];

  if (chapters.length !== chapterOrder.length) {
    const error = new Error(
      "Chapter order must contain every chapter exactly once.",
    );

    error.statusCode = 400;

    throw error;
  }

  const existingNumbers = chapters.map((chapter) => chapter.chapterNumber);

  const requestedNumbers = [...chapterOrder].sort((a, b) => a - b);

  const actualNumbers = [...existingNumbers].sort((a, b) => a - b);

  const isValid =
    JSON.stringify(requestedNumbers) === JSON.stringify(actualNumbers);

  if (!isValid) {
    const error = new Error("Invalid chapter order.");

    error.statusCode = 400;

    throw error;
  }

  const chapterMap = new Map(
    chapters.map((chapter) => [chapter.chapterNumber, chapter]),
  );

  const reordered = chapterOrder.map((chapterNumber, index) => {
    const chapter = chapterMap.get(chapterNumber);

    return {
      ...chapter.toObject?.(),
      chapterNumber: index + 1,
    };
  });

  ebook.outline.chapters = reordered;

  ebook.status = "outline_ready";

  await ebook.save();

  return ebook;
};

export default {
  generateOutline,
  updateOutline,
  approveOutline,
  updateOutlineChapter,
  addOutlineChapter,
  deleteOutlineChapter,
  reorderOutlineChapters,
};
