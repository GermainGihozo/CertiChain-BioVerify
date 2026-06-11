// Vercel serverless function entry point (root level)
const path = require("path");

// Load environment variables
require("dotenv").config({ path: path.join(__dirname, "../backend/.env") });

const app = require("../backend/src/app");
const connectDB = require("../backend/src/config/database");

let isConnected = false;

// Connect to database once
async function ensureConnection() {
  if (!isConnected) {
    try {
      // Check if MONGODB_URI exists
      if (!process.env.MONGODB_URI) {
        throw new Error("MONGODB_URI environment variable is not set");
      }
      
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
    // Simple health check endpoint for debugging
    if (req.url === '/health' || req.url === '/api/health') {
      return res.status(200).json({ 
        status: "ok",
        timestamp: new Date().toISOString(),
        env: {
          hasMongoUri: !!process.env.MONGODB_URI,
          hasJwtSecret: !!process.env.JWT_SECRET,
          nodeEnv: process.env.NODE_ENV
        }
      });
    }
    
    // Ensure database connection
    await ensureConnection();
    
    // Log incoming request
    console.log(`${req.method} ${req.url}`);
    
    // Forward to Express app
    return app(req, res);
  } catch (error) {
    console.error("API Error:", error);
    console.error("Stack:", error.stack);
    return res.status(500).json({ 
      error: "Internal server error",
      message: error.message,
      stack: process.env.NODE_ENV === 'production' ? undefined : error.stack
    });
  }
};
