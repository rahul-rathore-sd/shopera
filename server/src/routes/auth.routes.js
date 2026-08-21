import { Router } from "express";
import {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  getCurrentUser,
  changeCurrentPassword,
  updateAccountDetails,
  updateUserAvatar,
  getUserAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  forgotPassword,
  resetPassword,
  getAllUsersAdmin,
  updateUserRoleAdmin,
} from "../controllers/auth.controller.js";
import { verifyJWT, verifyAdmin } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// --- Public Routes ---
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refresh-token", refreshAccessToken);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.post("/reset-password", resetPassword);

// --- Protected Routes (Require Authentication) ---
router.use(verifyJWT);

router.post("/logout", logoutUser);
router.get("/me", getCurrentUser);
router.patch("/change-password", changeCurrentPassword);
router.patch("/update-account", updateAccountDetails);
router.patch("/avatar", upload.single("avatar"), updateUserAvatar);

// Address Management
router.get("/addresses", getUserAddresses);
router.post("/addresses", addAddress);
router.put("/addresses/:addressId", updateAddress);
router.delete("/addresses/:addressId", deleteAddress);
router.patch("/addresses/:addressId/default", setDefaultAddress);

// Admin User Management
router.get("/admin/users", verifyAdmin, getAllUsersAdmin);
router.patch("/admin/users/:id/role", verifyAdmin, updateUserRoleAdmin);

export default router;
