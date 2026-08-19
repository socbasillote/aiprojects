import specificationService from "../services/ebook/specification.service.js";

import outlineService from "../services/ebook/outline.service.js";
import reorderOutlineSchema from "../validators/reorderOutline.validator.js";

import ebookService from "../services/ebook/ebook.service.js";
import chapterService from "../services/ebook/chapter.service.js";
import imageService from "../services/ebook/image.service.js";
import coverService from "../services/ebook/cover.service.js";

const createEbook = async (req, res) => {
  const ebook = await ebookService.createEbook({
    userId: req.user._id,
    data: req.body,
  });

  res.status(201).json({
    success: true,
    message: "Ebook created successfully.",
    data: {
      ebook,
    },
  });
};

const getEbooks = async (req, res) => {
  const ebooks = await ebookService.getEbooks({
    userId: req.user._id,
  });

  res.status(200).json({
    success: true,
    data: {
      ebooks,
    },
  });
};

const getEbook = async (req, res) => {
  const ebook = await ebookService.getEbookById({
    ebookId: req.params.id,
    userId: req.user._id,
  });

  res.status(200).json({
    success: true,
    data: {
      ebook,
    },
  });
};

const updateEbook = async (req, res) => {
  const ebook = await ebookService.updateEbook({
    ebookId: req.params.id,
    userId: req.user._id,
    data: req.body,
  });

  res.status(200).json({
    success: true,
    message: "Ebook updated successfully.",
    data: {
      ebook,
    },
  });
};

const deleteEbook = async (req, res) => {
  const ebookId = await ebookService.deleteEbook({
    ebookId: req.params.id,
    userId: req.user._id,
  });

  res.status(200).json({
    success: true,
    message: "Ebook deleted successfully.",
    data: {
      ebookId,
    },
  });
};

const generateSpecification = async (req, res) => {
  const ebook = await specificationService.generateSpecification({
    ebookId: req.params.id,
    userId: req.user._id,
  });

  res.status(200).json({
    success: true,
    message: "Ebook specification generated successfully.",
    data: {
      ebook,
    },
  });
};

const updateSpecification = async (req, res) => {
  const ebook = await specificationService.updateSpecification({
    ebookId: req.params.id,
    userId: req.user._id,
    specification: req.body,
  });

  res.status(200).json({
    success: true,
    message: "Ebook specification updated successfully.",
    data: {
      ebook,
    },
  });
};

const generateOutline = async (req, res) => {
  const ebook = await outlineService.generateOutline({
    ebookId: req.params.id,
    userId: req.user._id,
  });

  res.status(200).json({
    success: true,
    message: "Ebook outline generated successfully.",
    data: {
      ebook,
    },
  });
};

const updateOutline = async (req, res) => {
  const ebook = await outlineService.updateOutline({
    ebookId: req.params.id,
    userId: req.user._id,
    outline: req.body,
  });

  res.status(200).json({
    success: true,
    message: "Ebook outline updated successfully.",
    data: {
      ebook,
    },
  });
};

const approveOutline = async (req, res) => {
  const ebook = await outlineService.approveOutline({
    ebookId: req.params.id,
    userId: req.user._id,
  });

  res.status(200).json({
    success: true,
    message: "Ebook outline approved successfully.",
    data: {
      ebook,
    },
  });
};

const approveSpecification = async (req, res) => {
  const ebook = await specificationService.approveSpecification({
    ebookId: req.params.id,
    userId: req.user._id,
  });

  res.status(200).json({
    success: true,
    message: "Ebook specification approved successfully.",
    data: {
      ebook,
    },
  });
};

const updateOutlineChapter = async (req, res) => {
  const chapterNumber = Number(req.params.chapterNumber);

  const ebook = await outlineService.updateOutlineChapter({
    ebookId: req.params.id,
    userId: req.user._id,
    chapterNumber,
    chapter: req.body,
  });

  res.status(200).json({
    success: true,
    message: "Outline chapter updated.",
    data: {
      ebook,
    },
  });
};

const addOutlineChapter = async (req, res) => {
  const ebook = await outlineService.addOutlineChapter({
    ebookId: req.params.id,
    userId: req.user._id,
    chapter: req.body,
  });

  res.status(201).json({
    success: true,
    message: "Outline chapter added.",
    data: {
      ebook,
    },
  });
};

const deleteOutlineChapter = async (req, res) => {
  const chapterNumber = Number(req.params.chapterNumber);

  const ebook = await outlineService.deleteOutlineChapter({
    ebookId: req.params.id,
    userId: req.user._id,
    chapterNumber,
  });

  res.status(200).json({
    success: true,
    message: "Outline chapter deleted.",
    data: {
      ebook,
    },
  });
};

const reorderOutlineChapters = async (req, res) => {
  const { chapterOrder } = reorderOutlineSchema.parse(req.body);

  const ebook = await outlineService.reorderOutlineChapters({
    ebookId: req.params.id,
    userId: req.user._id,
    chapterOrder,
  });

  res.status(200).json({
    success: true,
    message: "Outline chapters reordered.",
    data: {
      ebook,
    },
  });
};

const generateChapters = async (req, res) => {
  const ebook = await chapterService.generateChapters({
    ebookId: req.params.id,
    userId: req.user._id,
  });

  res.status(200).json({
    success: true,
    message: "Ebook chapters generated successfully.",
    data: {
      ebook,
    },
  });
};

const approveChapters = async (req, res) => {
  const ebook = await chapterService.approveChapters({
    ebookId: req.params.id,
    userId: req.user._id,
  });

  res.status(200).json({
    success: true,
    message: "Ebook chapters approved successfully.",
    data: {
      ebook,
    },
  });
};

const generateImagePlan = async (req, res) => {
  const ebook = await imageService.generateImagePlan({
    ebookId: req.params.id,
    userId: req.user._id,
  });

  res.status(200).json({
    success: true,
    message: "Ebook image plan generated successfully.",
    data: {
      ebook,
    },
  });
};

const approveImagePlan = async (req, res) => {
  const ebook = await imageService.approveImagePlan({
    ebookId: req.params.id,
    userId: req.user._id,
  });

  res.status(200).json({
    success: true,
    message: "Ebook image plan approved successfully.",
    data: {
      ebook,
    },
  });
};

const generateImages = async (req, res) => {
  const ebook = await imageService.generateImages({
    ebookId: req.params.id,
    userId: req.user._id,
  });

  res.status(200).json({
    success: true,
    message: "Ebook images generated successfully.",
    data: {
      ebook,
    },
  });
};

const approveImages = async (req, res) => {
  const ebook = await imageService.approveImages({
    ebookId: req.params.id,
    userId: req.user._id,
  });

  res.status(200).json({
    success: true,
    message: "Ebook images approved successfully.",
    data: {
      ebook,
    },
  });
};

const generateCover = async (req, res) => {
  const ebook = await coverService.generateCover({
    ebookId: req.params.id,
    userId: req.user._id,
  });

  res.status(200).json({
    success: true,
    message: "Ebook cover generated successfully.",
    data: {
      ebook,
    },
  });
};

const approveCover = async (req, res) => {
  const ebook = await coverService.approveCover({
    ebookId: req.params.id,
    userId: req.user._id,
  });

  res.status(200).json({
    success: true,
    message: "Ebook cover approved successfully.",
    data: {
      ebook,
    },
  });
};

export {
  createEbook,
  getEbooks,
  getEbook,
  updateEbook,
  deleteEbook,
  generateSpecification,
  updateSpecification,
  approveSpecification,
  generateOutline,
  updateOutline,
  updateOutlineChapter,
  addOutlineChapter,
  deleteOutlineChapter,
  reorderOutlineChapters,
  approveOutline,
  generateChapters,
  approveChapters,
  generateImagePlan,
  approveImagePlan,
  generateImages,
  approveImages,
  generateCover,
  approveCover,
};
