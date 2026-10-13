import User from "../models/user.model.js";
import Product from "../models/product.model.js";
import Order from "../models/order.model.js";

const ALLOWED_RANGE_DAYS = [7, 30, 365];

export const getAnalyticsData = async () => {
  const [totalCustomers, totalProducts, salesData] = await Promise.all([
    User.countDocuments({ role: "customer" }),
    Product.countDocuments(),
    Order.aggregate([
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: "$totalAmount" },
        },
      },
    ]),
  ]);

  const { totalOrders, totalRevenue } = salesData[0] || {
    totalOrders: 0,
    totalRevenue: 0,
  };

  return { totalCustomers, totalProducts, totalOrders, totalRevenue };
};

export const getDailySalesData = async (startDate, endDate) => {
  const dailySalesData = await Order.aggregate([
    {
      $match: {
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        sales: { $sum: 1 },
        revenue: { $sum: "$totalAmount" },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const dateArray = getDatesInRange(startDate, endDate);

  return dateArray.map((date) => {
    const foundData = dailySalesData.find((item) => item._id === date);

    return {
      date,
      sales: foundData?.sales || 0,
      revenue: foundData?.revenue || 0,
    };
  });
};

export const getTopProducts = async (startDate, endDate, limit = 5) => {
  const topProducts = await Order.aggregate([
    { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
    { $unwind: "$products" },
    {
      $group: {
        _id: "$products.product",
        quantitySold: { $sum: "$products.quantity" },
        revenue: {
          $sum: { $multiply: ["$products.price", "$products.quantity"] },
        },
      },
    },
    { $sort: { quantitySold: -1 } },
    { $limit: limit },
  ]);

  const productIds = topProducts.map((item) => item._id);
  const products = await Product.find({ _id: { $in: productIds } }).select(
    "name image",
  );
  const productsById = new Map(
    products.map((product) => [product._id.toString(), product]),
  );

  return topProducts
    .map((item) => {
      const product = productsById.get(item._id.toString());

      if (!product) return null;

      return {
        productId: item._id.toString(),
        name: product.name,
        image: product.image,
        quantitySold: item.quantitySold,
        revenue: item.revenue,
      };
    })
    .filter(Boolean);
};

export const getRecentOrders = async (limit = 10) => {
  const orders = await Order.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("user", "name email")
    .select("user totalAmount paymentStatus createdAt")
    .lean();

  return orders.map((order) => ({
    _id: order._id.toString(),
    user: order.user
      ? { name: order.user.name, email: order.user.email }
      : null,
    totalAmount: order.totalAmount,
    paymentStatus: order.paymentStatus,
    createdAt: order.createdAt,
  }));
};

export const getAnalytics = async (req, res, next) => {
  try {
    const requestedDays = Number(req.query.days);
    const days = ALLOWED_RANGE_DAYS.includes(requestedDays)
      ? requestedDays
      : 7;

    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

    const [summary, dailySales, topProducts, recentOrders] =
      await Promise.all([
        getAnalyticsData(),
        getDailySalesData(startDate, endDate),
        getTopProducts(startDate, endDate),
        getRecentOrders(),
      ]);

    res.json({
      summary,
      dailySales,
      topProducts,
      recentOrders,
      range: { days, startDate, endDate },
    });
  } catch (error) {
    console.log("Error in getAnalytics controller", error);
    next(error);
  }
};

const getDatesInRange = (startDate, endDate) => {
  const dates = [];
  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    dates.push(currentDate.toISOString().split("T")[0]);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
};
