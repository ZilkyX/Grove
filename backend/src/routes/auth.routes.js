import { Router } from "express";
import {
  login,
  signUp,
  logout,
  refreshToken,
} from "../controllers/auth.controller.js";
import { signUpSchema, loginSchema } from "../validators/auth.validator.js";
import { validator } from "../middlewares/validator.middleware.js";

const router = Router();

router.post("/signup", validator(signUpSchema), signUp);
router.post("/login", validator(loginSchema), login);
router.post("/logout", logout);
router.post("/refresh-token", refreshToken);

export default router;
