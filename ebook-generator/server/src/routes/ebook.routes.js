import { Router } from "express";

import {
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
} from "../controllers/ebook.controller.js";

import authMiddleware from "../middleware/auth.middleware.js";

import validateMiddleware from "../middleware/validate.middleware.js";

import {
  createEbookSchema,
  updateEbookSchema,
} from "../validators/ebook.validator.js";

const router = Router();

router.use(authMiddleware);

/*
|--------------------------------------------------------------------------
| Ebook CRUD
|--------------------------------------------------------------------------
*/

router.post("/", validateMiddleware(createEbookSchema), createEbook);

router.get("/", getEbooks);

router.get("/:id", getEbook);

router.patch("/:id", validateMiddleware(updateEbookSchema), updateEbook);

router.delete("/:id", deleteEbook);

/*
|--------------------------------------------------------------------------
| Specification
|--------------------------------------------------------------------------
*/

router.post("/:id/specification", generateSpecification);

router.patch("/:id/specification", updateSpecification);

router.post("/:id/specification/approve", approveSpecification);

/*
|--------------------------------------------------------------------------
| Outline
|--------------------------------------------------------------------------
*/

router.post("/:id/outline", generateOutline);

router.patch("/:id/outline", updateOutline);

router.post("/:id/outline/chapters", addOutlineChapter);

router.patch("/:id/outline/chapters/:chapterNumber", updateOutlineChapter);

router.delete("/:id/outline/chapters/:chapterNumber", deleteOutlineChapter);

router.patch("/:id/outline/reorder", reorderOutlineChapters);

router.post("/:id/outline/approve", approveOutline);

/*
|--------------------------------------------------------------------------
| Chapters
|--------------------------------------------------------------------------
*/

router.post("/:id/chapters", generateChapters);

router.post("/:id/chapters/approve", approveChapters);

/*
|--------------------------------------------------------------------------
| Images
|--------------------------------------------------------------------------
*/

router.post("/:id/images", generateImagePlan);

router.post("/:id/images/approve", approveImagePlan);

export default router;
