// Vercel serverless function entry point (root level)
const path = require("path");

// Simple test to see if function can even start
module.exports = async (req, res) => {
  try {
    // Test 1: Can we respond at all?
    if (req.url === '/test') {
      return res.status(200).json({ 
        message: "Function is running!",
        url: req.url,
        method: req.method
      });
    }

    // Test 2: Can we load dotenv?
    require("dotenv").config({ path: path.join(__dirname, "../backend/.env") });
    
    // Test 3: Check environment variables
    if (req.url === '/env-check') {
      return res.status(200).json({ 
        hasMongoUri: !!process.env.MONGODB_URI,
        hasJwtSecret: !!process.env.JWT_SECRET,
        nodeEnv: process.env.NODE_ENV || 'not set'
      });
    }

    // Test 4: Can we load the database module?
    if (req.url === '/db-test') {
      try {
        const connectDB = require("../backend/src/config/database");
        return res.status(200).json({ message: "Database module loaded successfully" });
      } catch (error) {
        return res.status(500).json({ 
          error: "Failed to load database module",
          message: error.message 
        });
      }
    }

    // Test 5: Can we load the app?
    if (req.url === '/app-test') {
      try {
        const app = require("../backend/src/app");
        return res.status(200).json({ message: "App module loaded successfully" });
      } catch (error) {
        return res.status(500).json({ 
          error: "Failed to load app module",
          message: error.message,
          stack: error.stack
        });
      }
    }

    // Default response
    return res.status(200).json({ 
      message: "API is running",
      endpoints: ['/test', '/env-check', '/db-test', '/app-test']
    });

  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({ 
      error: "Internal server error",
      message: error.message,
      stack: error.stack
    });
  }
};
