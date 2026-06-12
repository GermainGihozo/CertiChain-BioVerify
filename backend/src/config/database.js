const mongoose = require("mongoose");
const logger = require("./logger");

async function connectDB() {
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/certchain";

  try {
    console.log("Attempting MongoDB connection...");
    console.log("URI preview:", uri.substring(0, 30) + "...");
    
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
      socketTimeoutMS: 45000,
    });
    
    logger.info("✅ MongoDB connected:", uri.replace(/\/\/.*@/, "//***@"));
    console.log("✅ MongoDB connected successfully");
  } catch (err) {
    logger.error("MongoDB connection error:", err.message);
    console.error("❌ MongoDB connection failed:");
    console.error("Error name:", err.name);
    console.error("Error message:", err.message);
    console.error("Error code:", err.code);
    // Don't use process.exit in serverless - throw error instead
    throw new Error(`MongoDB connection failed: ${err.message}`);
  }

  mongoose.connection.on("disconnected", () => {
    logger.warn("MongoDB disconnected");
  });

  mongoose.connection.on("error", (err) => {
    logger.error("MongoDB error:", err.message);
  });
}

module.exports = connectDB;
