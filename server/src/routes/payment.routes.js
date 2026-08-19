import { Router } from "express";
import {
  createRazorpayOrder,
  verifyPaymentSignature,
  handleRazorpayWebhook,
} from "../controllers/payment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Webhook route (No JWT auth — validated by cryptographic signature)
router.post("/webhook", handleRazorpayWebhook);

// Protected routes
router.post("/create-order", verifyJWT, createRazorpayOrder);
router.post("/verify-signature", verifyJWT, verifyPaymentSignature);

export default router;