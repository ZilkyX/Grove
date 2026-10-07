import Coupon from "../models/coupon.model.js";

export const getCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findOne({
      userId: req.user._id,
      isActive: true,
    });

    res.json(coupon || null);
  } catch (error) {
    console.log("Error in getCoupon controller.", error);
    next(error);
  }
};

export const validateCoupon = async (req, res, next) => {
  try {
    const { code } = req.body;
    const coupon = await Coupon.find({
      code,
      userId: req.user._id,
      isActive: true,
    });

    if (!coupon) {
      return res.status(404).json({
        message: "Coupon not found or inactive.",
      });
    }

    if (coupon.expirationDate < new Date()) {
      coupon.isActive = false;
      await coupon.save();

      return res.status(400).json({
        message: "Coupon expired.",
      });
    }

    res.status(200).json({
      message: "Coupon is valid.",
      coupon,
    });
  } catch (error) {
    console.log("Error in validateCoupon controller.", error);
    next(error);
  }
};
