import { Router } from "express";
import {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  updateDeliveryPreferences,
  cancelOrder,
} from "../controllers/order.controller.js";
import { verifyJWT, verifyAdmin } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/").post(createOrder).get(getMyOrders);
router.route("/:id").get(getOrderById);
router.route("/:id/delivery-preferences").patch(updateDeliveryPreferences);
router.route("/:id/cancel").put(cancelOrder);
router.route("/:id/status").put(verifyAdmin, updateOrderStatus);

export default router;