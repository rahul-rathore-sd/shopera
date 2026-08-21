import { Router } from "express";
import {
  createProduct,
  getAllProducts,
  getProductBySlug,
  getProductById,
  updateProduct,
  deleteProduct,
  adminSeedCatalog,
} from "../controllers/product.controller.js";
import { verifyJWT, verifyAdmin } from "../middlewares/auth.middleware.js";

const router = Router();

// Public routes
router.get("/", getAllProducts);
router.get("/slug/:slug", getProductBySlug);

// Admin-protected routes
router.get("/id/:id", verifyJWT, verifyAdmin, getProductById);
router.post("/admin/seed", verifyJWT, verifyAdmin, adminSeedCatalog);
router.post("/", verifyJWT, verifyAdmin, createProduct);
router.put("/:id", verifyJWT, verifyAdmin, updateProduct);
router.delete("/:id", verifyJWT, verifyAdmin, deleteProduct);

export default router;