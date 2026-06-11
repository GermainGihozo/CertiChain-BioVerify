// Vercel serverless function entry point (root level)
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../backend/.env") });

const app = require("../backend/src/app");
const connectDB = require("../backend/src/config/database");

let isConnected = false;

// Connect to database once
async function ensureConnection() {
  if (!isConnected) {
    try {
      await connectDB();
      isConnected = true;
      console.log("✅ Database connected for serverless function");
    } catch (error) {
      console.error("❌ Database connection failed:", error.message);
      throw error;
    }
  }
}

// Export the Express app as a serverless function
module.exports = async (req, res) => {
  try {
    // Ensure database connection
    await ensureConnection();
    
    // Log incoming request
    console.log(`${req.method} ${req.url}`);
    
    // Forward to Express app
    return app(req, res);
  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({ 
      error: "Internal server error",
      message: error.message 
    });
  }
};
