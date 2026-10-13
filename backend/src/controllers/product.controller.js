import Product from "../models/product.model.js";
import { redis } from "../config/redis.js";
import { AppError } from "../utils/app-error.js";
import cloudinary from "../config/cloudinary.js";

const SORT_OPTIONS = {
  newest: { createdAt: -1 },
  "price-asc": { price: 1 },
  "price-desc": { price: -1 },
};

const buildProductFilter = (query) => {
  const filter = {};

  if (query.category) {
    filter.category = query.category;
  }

  if (query.search) {
    filter.name = { $regex: String(query.search).trim(), $options: "i" };
  }

  return filter;
};

const getPagination = (query) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
  return { page, limit, skip: (page - 1) * limit };
};

export const getProducts = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const filter = buildProductFilter(req.query);
    const sort = SORT_OPTIONS[req.query.sort] ?? SORT_OPTIONS.newest;

    const [products, total] = await Promise.all([
      Product.find(filter).sort(sort).skip(skip).limit(limit),
      Product.countDocuments(filter),
    ]);

    res.json({
      products,
      page,
      totalPages: Math.ceil(total / limit),
      totalProducts: total,
    });
  } catch (error) {
    console.log("Error in getProducts controller", error);
    next(error);
  }
};

export const browseProducts = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const filter = buildProductFilter(req.query);
    const sort = SORT_OPTIONS[req.query.sort] ?? SORT_OPTIONS.newest;

    const [products, total, categories] = await Promise.all([
      Product.find(filter)
        .select("name description price image category isFeatured")
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Product.countDocuments(filter),
      Product.distinct("category"),
    ]);

    res.json({
      products,
      page,
      totalPages: Math.ceil(total / limit),
      totalProducts: total,
      categories: categories.sort(),
    });
  } catch (error) {
    console.log("Error in browseProducts controller", error);
    next(error);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const { name, description, price, image, category, isFeatured } =
      req.body;

    if (!image) {
      throw new AppError("Product image is required.", 400);
    }

    let cloudinaryResponse;

    try {
      cloudinaryResponse = await cloudinary.uploader.upload(image, {
        folder: "products",
      });
    } catch (uploadError) {
      console.log("Error uploading product image to Cloudinary", uploadError);
      throw new AppError(
        "Couldn't upload the product image. Please try again.",
        502,
      );
    }

    const product = await Product.create({
      name,
      description,
      price,
      image: cloudinaryResponse.secure_url,
      imagePublicId: cloudinaryResponse.public_id,
      category,
      isFeatured,
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
      } catch (destroyError) {
        console.log(
          "Error deleting product image from Cloudinary (continuing with DB deletion)",
          destroyError,
        );
      }
    }

    await Product.findByIdAndDelete(req.params.id);
    await redis.del("featured_products");

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
      return res.json(featureProducts);
    }

    featureProducts = await Product.find({ isFeatured: true }).lean();

    if (!featureProducts) {
      throw new AppError("No featured products found.", 404);
    }

    await redis.set("featured_products", featureProducts, {
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
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find({ category: req.params.category }).skip(skip).limit(limit),
      Product.countDocuments({ category: req.params.category }),
    ]);

    res.json({
      products,
      page,
      totalPages: Math.ceil(total / limit),
      totalProducts: total,
    });
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
      let cloudinaryResponse;

      try {
        cloudinaryResponse = await cloudinary.uploader.upload(image, {
          folder: "products",
        });
      } catch (uploadError) {
        console.log("Error uploading product image to Cloudinary", uploadError);
        throw new AppError(
          "Couldn't upload the product image. Please try again.",
          502,
        );
      }

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
