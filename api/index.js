// Vercel serverless function entry point (root level)
const path = require("path");

// Simple test to see if function can even start
module.exports = async (req, res) => {
  try {
    // Normalize URL (remove /api prefix if present)
    const url = req.url.replace(/^\/api/, '') || '/';
    
    // Test 1: Can we respond at all?
    if (url === '/test' || url === '/') {
      return res.status(200).json({ 
        message: "✅ Function is running!",
        originalUrl: req.url,
        normalizedUrl: url,
        method: req.method
      });
    }

    // Test 2: Can we load dotenv?
    require("dotenv").config({ path: path.join(__dirname, "../backend/.env") });
    
    // Test 3: Check environment variables
    if (url === '/env-check') {
      return res.status(200).json({ 
        hasMongoUri: !!process.env.MONGODB_URI,
        hasJwtSecret: !!process.env.JWT_SECRET,
        hasJwtExpires: !!process.env.JWT_EXPIRES_IN,
        nodeEnv: process.env.NODE_ENV || 'not set',
        mongoUriStart: process.env.MONGODB_URI ? process.env.MONGODB_URI.substring(0, 20) + '...' : 'not set'
      });
    }

    // Test 4: Can we load the database module?
    if (url === '/db-test') {
      try {
        const connectDB = require("../backend/src/config/database");
        return res.status(200).json({ message: "✅ Database module loaded successfully" });
      } catch (error) {
        return res.status(500).json({ 
          error: "❌ Failed to load database module",
          message: error.message,
          stack: error.stack
        });
      }
    }

    // Test 5: Can we load the app?
    if (url === '/app-test') {
      try {
        const app = require("../backend/src/app");
        return res.status(200).json({ message: "✅ App module loaded successfully" });
      } catch (error) {
        return res.status(500).json({ 
          error: "❌ Failed to load app module",
          message: error.message,
          stack: error.stack
        });
      }
    }

    // Default response
    return res.status(200).json({ 
      message: "API is running - try these endpoints",
      endpoints: [
        '/api/test',
        '/api/env-check', 
        '/api/db-test', 
        '/api/app-test'
      ],
      receivedUrl: req.url
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
