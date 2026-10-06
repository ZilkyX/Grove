import { Router } from "express";
import { adminRoute, protectRoute } from "../middlewares/auth.middleware";
import {
  createProduct,
  getProducts,
  getFeaturedProducts,
  deleteProduct,
  getRecommendedProducts,
  updateProduct,
  getProduct,
  getProductByCategory,
  toggleFeaturedProduct,
} from "../controllers/product.controller";

const router = Router();

router.post("/", protectRoute, adminRoute, createProduct);
router.get("/", protectRoute, adminRoute, getProducts);
router.post("/featured", getFeaturedProducts);
router.get("/recommended", getRecommendedProducts);
router.get("/category/:category", getProductByCategory);
router.get("/:id", getProduct);
router.put("/:id", protectRoute, adminRoute, updateProduct);
router.patch("/:id", protectRoute, adminRoute, toggleFeaturedProduct);
router.delete("/:id", protectRoute, adminRoute, deleteProduct);

export default router;
