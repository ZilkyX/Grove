import Product from "../models/product.model.js";
import { redis } from "../config/redis.js";
import { AppError } from "../utils/app-error.js";
import cloudinary from "../config/cloudinary.js";

export const getProducts = async (req, res, next) => {
  try {
    const products = await Product.find({});

    res.json(products);
  } catch (error) {
    console.log("Error in getProducts controller", error);
    next(error);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const { name, description, price, image, category } = req.body;

    if (!image) {
      throw new AppError("Product image is required.", 400);
    }

    let cloudinaryResponse = null;

    if (image) {
      cloudinaryResponse = await cloudinary.uploader.upload(image, {
        folder: "products",
      });
    }

    const product = await Product.create({
      name,
      description,
      price,
      image: cloudinaryResponse.secure_url,
      imagePublicId: cloudinaryResponse.public_id,
      category,
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully.",
      product,
    });
  } catch (error) {
    console.log("Error in createProduct controller", error);
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      throw new AppError("Product not found.", 404);
    }

    if (product.imagePublicId) {
      try {
        await cloudinary.uploader.destroy(product.imagePublicId);
      } catch (error) {
        throw error;
      }
    }

    await Product.findByIdAndDelete(req.params.id);

    res
      .status(200)
      .json({ success: true, message: "Product successfully deleted." });
  } catch (error) {
    console.log("Error in deleteProduct controller", error);
    next(error);
  }
};

export const getFeaturedProducts = async (req, res, next) => {
  try {
    let featureProducts = await redis.get("featured_products");

    if (featureProducts) {
      return res.json(JSON.parse(featureProducts));
    }

    featureProducts = await Product.find({ isFeatured: true }).lean();

    if (!featureProducts) {
      throw new AppError("No featured products found.", 404);
    }

    await redis.set("featured_products", JSON.stringify(featureProducts), {
      ex: 3600,
    });

    res.json(featureProducts);
  } catch (error) {
    console.log("Error in getFeaturedProducts controller", error);
    next(error);
  }
};

export const getRecommendedProducts = async (req, res, next) => {
  try {
    const products = await Product.aggregate([
      { $sample: { size: 3 } },
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          image: 1,
          price: 1,
        },
      },
    ]);

    res.json(products);
  } catch (error) {
    console.log("Error in getRecommendedProducts controller", error);
    next(error);
  }
};

export const getProductByCategory = async (req, res, next) => {
  try {
    const products = await Product.find({ category: req.params.category });

    res.json(products);
  } catch (error) {
    console.log("Error in getProductByCategory controller", error);
    next(error);
  }
};

export const getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      throw new AppError("Product not found.", 404);
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.log("Error in getProduct controller", error);
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, price, image, category } = req.body;

    const product = await Product.findById(id);

    if (!product) {
      throw new AppError("Product not found.", 404);
    }

    if (image) {
      const cloudinaryResponse = await cloudinary.uploader.upload(image, {
        folder: "products",
      });

      if (product.imagePublicId) {
        await cloudinary.uploader.destroy(product.imagePublicId);
      }

      product.image = cloudinaryResponse.secure_url;
      product.imagePublicId = cloudinaryResponse.public_id;
    }

    if (name !== undefined) product.name = name;
    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = price;
    if (category !== undefined) product.category = category;

    await product.save();

    await redis.del("featured_products");

    res.status(200).json({
      success: true,
      message: "Product updated successfully.",
      product,
    });
  } catch (error) {
    console.log("Error in updateProduct controller:", error);
    next(error);
  }
};

export const toggleFeaturedProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      throw new AppError("Product not found.", 404);
    }

    product.isFeatured = !product.isFeatured;

    await product.save();

    await redis.del("featured_products");

    res.status(200).json({
      success: true,
      message: "Product featured status updated.",
      product,
    });
  } catch (error) {
    console.log("Error in toggleFeaturedProduct controller", error);
    next(error);
  }
};
