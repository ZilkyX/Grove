import jwt from "jsonwebtoken";
import { AppError } from "../utils/app-error.js";
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
  try {
    const accessToken = req.cookies.accessToken;

    if (!accessToken) {
      throw new AppError("Unauthorized - No token provided.", 401);
    }

    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decoded.userId);

    if (!user) {
      throw new AppError("User not found.", 404);
    }

    req.user = user;

    next();
  } catch (error) {
    console.error("Error in protectRoute middleware:", error);

    if (
      error.name === "TokenExpiredError" ||
      error.name === "JsonWebTokenError"
    ) {
      return next(new AppError("Unauthorized - Invalid access token.", 401));
    }

    next(error);
  }
};

export const adminRoute = (req, res, next) => {
  try {
    if (req.user && req.user.role === "admin") {
      next();
    } else {
      throw new AppError("Access denied - Admin only", 403);
    }
  } catch (error) {
    console.error("Error in adminRoute middleware:", error);
  }
};
