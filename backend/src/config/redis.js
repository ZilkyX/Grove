import { Redis } from "@upstash/redis";
import { config } from "dotenv";

config();

export const redis = Redis.fromEnv();
