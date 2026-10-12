import crypto from "crypto";
import { AppError } from "../utils/app-error.js";
import Coupon from "../models/coupon.model.js";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import { stripe } from "../config/stripe.js";

export const createCheckoutSession = async (req, res, next) => {
  try {
    const { products, couponCode } = req.body;

    if (!Array.isArray(products) || products.length === 0) {
      throw new AppError("Invalid or empty products array", 400);
    }

    const productIds = products.map((product) => product._id);
    const dbProducts = await Product.find({ _id: { $in: productIds } });
    const dbProductsById = new Map(
      dbProducts.map((product) => [product._id.toString(), product]),
    );

    let totalAmount = 0;

    const lineItems = products.map((product) => {
      const dbProduct = dbProductsById.get(String(product._id));

      if (!dbProduct) {
        throw new AppError(`Product not found: ${product._id}`, 400);
      }

      const quantity = Number(product.quantity);

      if (!Number.isInteger(quantity) || quantity <= 0) {
        throw new AppError(`Invalid quantity for product: ${product._id}`, 400);
      }

      const amount = Math.round(dbProduct.price * 100);
      totalAmount += amount * quantity;

      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: dbProduct.name,
            images: [dbProduct.image],
          },
          unit_amount: amount,
        },
        quantity,
      };
    });

    let coupon = null;

    if (couponCode) {
      coupon = await Coupon.findOne({
        code: couponCode,
        userId: req.user._id,
        isActive: true,
        expirationDate: { $gt: new Date() },
      });

      if (!coupon) {
        throw new AppError("Invalid or expired coupon", 400);
      }

      totalAmount -= Math.round(
        (totalAmount * coupon.discountPercentage) / 100,
      );
    }

    const session = await stripe.checkout.sessions.create({
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/cancel`,
      discounts: coupon
        ? [{ coupon: await createStripeCoupon(coupon.discountPercentage) }]
        : [],
      metadata: {
        userId: req.user._id.toString(),
        couponCode: couponCode || "",
        products: JSON.stringify(
          products.map((product) => {
            const dbProduct = dbProductsById.get(String(product._id));

            return {
              id: dbProduct._id.toString(),
              quantity: Number(product.quantity),
              price: dbProduct.price,
            };
          }),
        ),
      },
    });

    if (totalAmount >= 20000) {
      await createNewCoupon(req.user._id);
    }

    res.status(200).json({ id: session.id, totalAmount: totalAmount / 100 });
  } catch (error) {
    console.log("Error in createCheckoutSession", error);
    next(error);
  }
};

const createNewCoupon = async (userId) => {
  const newCoupon = new Coupon({
    code: "GIFT" + crypto.randomBytes(4).toString("hex").toUpperCase(),
    discountPercentage: 10,
    expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    userId: userId,
  });

  await newCoupon.save();

  return newCoupon;
};

const createStripeCoupon = async (discountPercentage) => {
  const coupon = await stripe.coupons.create({
    percent_off: discountPercentage,
    duration: "once",
  });

  return coupon.id;
};

export const checkoutSuccess = async (req, res, next) => {
  try {
    const { sessionId } = req.body;

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid") {
      if (session.metadata.couponCode) {
        await Coupon.findOneAndUpdate(
          {
            code: session.metadata.couponCode,
            userId: session.metadata.userId,
          },
          { isActive: false },
        );
      }

      const products = JSON.parse(session.metadata.products);

      const newOrder = new Order({
        user: session.metadata.userId,

        products: products.map((product) => ({
          product: product.id,
          quantity: product.quantity,
          price: product.price,
        })),

        totalAmount: session.amount_total / 100,

        paymentStatus: "paid",

        stripeSessionId: session.id,

        stripePaymentIntentId: session.payment_intent,
      });

      await newOrder.save();

      res.status(200).json({
        success: true,
        message:
          "Payment successful, order created, and coupon deactivated if used.",
        orderId: newOrder._id,
      });
    } else {
      res.status(400).json({
        success: false,
        message: `Payment not completed (status: ${session.payment_status}).`,
      });
    }
  } catch (error) {
    console.log("Error in checkoutSuccess", error);
    next(error);
  }
};
