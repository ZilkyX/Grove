import { Router } from "express";
import { adminRoute, protectRoute } from "../middlewares/auth.middleware.js";
import { getAnalytics } from "../controllers/analytics.controller.js";

const router = Router();

router.get("/", protectRoute, adminRoute, getAnalytics);

export default router;
