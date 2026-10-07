import { Router } from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import {
  getCartProducts,
  addToCart,
  clearCart,
  removeFromCart,
  updateQuantity,
} from "../controllers/cart.controller.js";

const router = Router();

router.get("/", protectRoute, getCartProducts);
router.post("/", protectRoute, addToCart);
router.delete("/", protectRoute, clearCart);
router.delete("/remove-item", protectRoute, removeFromCart);
router.put("/:productId", protectRoute, updateQuantity);

export default router;
