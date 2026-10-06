import User from "../models/user.model.js";
import { AppError } from "../utils/index.js";

export const signUp = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) throw new AppError("User already exist.", 400);

    const user = await User.create({ name, email, password });

    res
      .status(201)
      .json({ success: true, message: "User successfully created.", user });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {


    
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
  } catch (error) {
    next(error);
  }
};
