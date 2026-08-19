import { Router } from "express";
import {
  createCategory,
  getAllCategories,
  getCategoryBySlug,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller.js";
import { verifyJWT, verifyAdmin } from "../middlewares/auth.middleware.js";

const router = Router();

// Public routes
router.get("/", getAllCategories);
router.get("/:slug", getCategoryBySlug);

// Admin-protected routes
router.post("/", verifyJWT, verifyAdmin, createCategory);
router.put("/:id", verifyJWT, verifyAdmin, updateCategory);
router.delete("/:id", verifyJWT, verifyAdmin, deleteCategory);

export default router;