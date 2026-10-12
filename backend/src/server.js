import mongoose from "mongoose";
import app from "./app.js";
import { connectDB } from "../src/config/db.js";

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  const server = app.listen(PORT, () => {
    console.log(`Server is running on PORT:${PORT}`);
  });

  const shutdown = (signal) => {
    console.log(`${signal} received. Shutting down gracefully...`);

    server.close(async () => {
      await mongoose.connection.close();
      console.log("HTTP server and MongoDB connection closed.");
      process.exit(0);
    });

    setTimeout(() => {
      console.error("Forced shutdown after timeout.");
      process.exit(1);
    }, 10000).unref();
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
});
