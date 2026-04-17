const mongoose = require("mongoose");
const logger = require("./logger");

async function connectDB() {
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/certchain";

  try {
    await mongoose.connect(uri);
    logger.info("✅ MongoDB connected:", uri.replace(/\/\/.*@/, "//***@"));
  } catch (err) {
    logger.error("MongoDB connection error:", err.message);
    process.exit(1);
  }

  mongoose.connection.on("disconnected", () => {
    logger.warn("MongoDB disconnected");
  });

  mongoose.connection.on("error", (err) => {
    logger.error("MongoDB error:", err.message);
  });
}

module.exports = connectDB;
