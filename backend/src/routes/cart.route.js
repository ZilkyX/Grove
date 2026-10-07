import { Router } from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", protectRoute, getCartProducts);
router.delete("/", protectRoute, removeAllFromCart);
router.delete("/remove-item", protectRoute, removeFromCart);
router.post("/", protectRoute, addToCart);
router.put("/:productId", protectRoute, updateQuantity);

export default router;
