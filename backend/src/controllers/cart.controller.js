import User from "../models/user.model.js";
import { AppError } from "../utils/app-error.js";

export const getCartProducts = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).populate("cartItems.product");

    if (!user) throw new AppError("User not found.", 404);

    res.status(200).json(user.cartItems);
  } catch (error) {
    console.log("Error in getCartProducts controller.", error);
    next(error);
  }
};

export const addToCart = async (req, res, next) => {
  try {
    const { productId } = req.body;
    const user = req.user;

    const existingProduct = user.cartItems.find(
      (item) => item._id === productId,
    );

    if (existingProduct) {
      existingProduct.quantity += 1;
    } else {
      user.cartItems.push(productId);
    }

    await user.save();

    res.status(200).json(user.cartItems);
  } catch (error) {
    console.log("Error in addToCart controller.", error);
    next(error);
  }
};

export const clearCart = async (req, res, next) => {
  try {
    const user = req.user;

    user.cartItems = [];

    await user.save();

    res.status(200).json({
      message: "Cart cleared successfully",
      cartItems: user.cartItems,
    });
  } catch (error) {
    console.log("Error in removeAllFromCart controller.", error);
    next(error);
  }
};

export const removeFromCart = async (req, res, next) => {
  try {
    const { productId } = req.body;
    const user = req.user;

    user.cartItems.pull(productId);

    await user.save();

    res.status(200).json(user.cartItems);
  } catch (error) {
    console.log("Error in removeFromCart controller.", error);
    next(error);
  }
};

export const updateQuantity = async (req, res, next) => {
  try {
    const { productId: id } = req.params;
    const { quantity } = req.body;
    const user = req.user;

    const existingProduct = user.cartItems.find((item) => item._id === id);

    if (!existingProduct) {
      throw new AppError("Item not found in the cart.", 404);
    }

    if (quantity <= 0) {
      user.cartItems.pull({
        product: id,
      });
    } else {
      existingProduct.quantity = quantity;
    }

    await user.save();

    res.status(200).json(user.cartItems);
  } catch (error) {
    console.log("Error in updateQuantity controller.", error);
    next(error);
  }
};
