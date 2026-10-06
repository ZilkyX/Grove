import { redis } from "../config/redis.js";

export const storeRefreshToken = async (userId, refreshToken) => {
  return redis.set(`refresh_token:${userId}`, refreshToken, {
    ex: 7 * 24 * 60 * 60,
  });
};
