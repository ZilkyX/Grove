import { Router } from "express";
import { adminRoute, protectRoute } from "../middlewares/auth.middleware.js";
import { validator } from "../middlewares/validator.middleware.js";
import {
  productSchema,
  productUpdateSchema,
} from "../validators/product.validator.js";
import {
  createProduct,
  getProducts,
  browseProducts,
  getFeaturedProducts,
  deleteProduct,
  getRecommendedProducts,
  updateProduct,
  getProduct,
  getProductByCategory,
  toggleFeaturedProduct,
} from "../controllers/product.controller.js";

const router = Router();

router.post(
  "/",
  protectRoute,
  adminRoute,
  validator(productSchema),
  createProduct,
);
router.get("/", protectRoute, adminRoute, getProducts);
router.get("/browse", browseProducts);
router.post("/featured", getFeaturedProducts);
router.get("/recommended", getRecommendedProducts);
router.get("/category/:category", getProductByCategory);
router.get("/:id", getProduct);
router.put(
  "/:id",
  protectRoute,
  adminRoute,
  validator(productUpdateSchema),
  updateProduct,
);
router.patch("/:id", protectRoute, adminRoute, toggleFeaturedProduct);
router.delete("/:id", protectRoute, adminRoute, deleteProduct);

export default router;
