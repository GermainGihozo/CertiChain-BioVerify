// Vercel serverless function entry point (root level)
const path = require("path");
const url = require("url");

// Simple test to see if function can even start
module.exports = async (req, res) => {
  try {
    // Parse URL properly
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const query = parsedUrl.query;
    
    // Extract path from query params if Vercel rewrites it that way
    const actualPath = query.path ? `/${query.path}` : pathname;
    
    // Test 1: Can we respond at all?
    if (actualPath === '/test' || actualPath === '/' || pathname === '/api') {
      return res.status(200).json({ 
        message: "✅ Function is running!",
        originalUrl: req.url,
        pathname: pathname,
        actualPath: actualPath,
        method: req.method
      });
    }

    // Test 2: Load dotenv first
    require("dotenv").config({ path: path.join(__dirname, "../backend/.env") });
    
    // Test 3: Check environment variables
    if (actualPath === '/env-check') {
      return res.status(200).json({ 
        status: "✅ Environment Check",
        hasMongoUri: !!process.env.MONGODB_URI,
        hasJwtSecret: !!process.env.JWT_SECRET,
        hasJwtExpires: !!process.env.JWT_EXPIRES_IN,
        nodeEnv: process.env.NODE_ENV || 'not set',
        mongoUriPreview: process.env.MONGODB_URI ? process.env.MONGODB_URI.substring(0, 25) + '...' : '❌ NOT SET'
      });
    }

    // Test 4: Can we load the database module?
    if (actualPath === '/db-test') {
      try {
        const connectDB = require("../backend/src/config/database");
        return res.status(200).json({ 
          status: "✅ Database module loaded successfully",
          canConnect: typeof connectDB === 'function'
        });
      } catch (error) {
        return res.status(500).json({ 
          status: "❌ Failed to load database module",
          error: error.message,
          stack: error.stack
        });
      }
    }

    // Test 5: Can we load the app?
    if (actualPath === '/app-test') {
      try {
        const app = require("../backend/src/app");
        return res.status(200).json({ 
          status: "✅ App module loaded successfully",
          isFunction: typeof app === 'function'
        });
      } catch (error) {
        return res.status(500).json({ 
          status: "❌ Failed to load app module",
          error: error.message,
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
      debug: {
        receivedUrl: req.url,
        pathname: pathname,
        actualPath: actualPath,
        query: query
      }
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
