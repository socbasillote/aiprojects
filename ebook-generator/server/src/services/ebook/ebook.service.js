import mongoose from "mongoose";

import Ebook from "../../models/Ebook.js";

const createEbook = async ({ userId, data }) => {
  const {
    title,
    subtitle,
    description,
    authorName,
    targetAudience,
    language,
    tone,
    ebookLength,
    chapterCount,
    writingStyle,
    contentType,
    imageMode,
    imageStyle,
  } = data;

  const ebook = await Ebook.create({
    userId,

    title,

    subtitle: subtitle || "",

    description,

    authorName: authorName || "",

    originalPrompt: description,

    settings: {
      targetAudience,
      language,
      tone,
      ebookLength,
      chapterCount,
      writingStyle,
      contentType,
      imageMode,
      imageStyle,
    },

    status: "draft",

    generationProgress: {
      stage: "created",
      status: "idle",
      message: "Ebook project created.",
      percentage: 0,
      updatedAt: new Date(),
    },
  });

  return ebook;
};

const getEbooks = async ({ userId }) => {
  return Ebook.find({
    userId,
  }).sort({
    updatedAt: -1,
  });
};

const getEbookById = async ({ ebookId, userId }) => {
  if (!mongoose.Types.ObjectId.isValid(ebookId)) {
    const error = new Error("Invalid ebook ID.");

    error.statusCode = 400;

    throw error;
  }

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

const updateEbook = async ({ ebookId, userId, data }) => {
  const ebook = await getEbookById({
    ebookId,
    userId,
  });

  if (data.title !== undefined) {
    ebook.title = data.title;
  }

  if (data.subtitle !== undefined) {
    ebook.subtitle = data.subtitle;
  }

  if (data.description !== undefined) {
    ebook.description = data.description;

    /*
     * Keep the original prompt unchanged.
     *
     * The original user request should remain
     * available to the AI even if the editable
     * description changes later.
     */
  }

  if (data.authorName !== undefined) {
    ebook.authorName = data.authorName;
  }

  if (data.settings) {
    ebook.settings = {
      ...(ebook.settings?.toObject?.() || ebook.settings || {}),
      ...data.settings,
    };
  }

  await ebook.save();

  return ebook;
};

const deleteEbook = async ({ ebookId, userId }) => {
  const ebook = await getEbookById({
    ebookId,
    userId,
  });

  await Ebook.deleteOne({
    _id: ebook._id,
    userId,
  });

  return ebook._id;
};

export default {
  createEbook,
  getEbooks,
  getEbookById,
  updateEbook,
  deleteEbook,
};
