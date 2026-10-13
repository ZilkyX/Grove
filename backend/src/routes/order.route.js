import { Router } from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import { getMyOrders } from "../controllers/order.controller.js";

const router = Router();

router.get("/my", protectRoute, getMyOrders);

export default router;
