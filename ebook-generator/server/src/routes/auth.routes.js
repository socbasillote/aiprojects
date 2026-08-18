import { Router } from "express";

import {
  register,
  login,
  logout,
  getCurrentUser,
} from "../controllers/auth.controller.js";

import authMiddleware from "../middleware/auth.middleware.js";

import validateMiddleware from "../middleware/validate.middleware.js";

import { registerSchema, loginSchema } from "../validators/auth.validator.js";

const router = Router();

router.post("/register", validateMiddleware(registerSchema), register);

router.post("/login", validateMiddleware(loginSchema), login);

router.post("/logout", logout);

router.get("/me", authMiddleware, getCurrentUser);

export default router;
