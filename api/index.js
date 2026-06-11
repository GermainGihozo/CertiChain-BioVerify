// Vercel serverless function entry point (root level)
const path = require("path");
const url = require("url");

// Load environment variables
require("dotenv").config({ path: path.join(__dirname, "../backend/.env") });

const app = require("../backend/src/app");
const connectDB = require("../backend/src/config/database");

let isConnected = false;

// Connect to database once
async function ensureConnection() {
  if (!isConnected) {
    try {
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
    // Parse URL to handle Vercel's rewrite query params
    const parsedUrl = url.parse(req.url, true);
    const query = parsedUrl.query;
    
    console.log("Incoming request:", {
      originalUrl: req.url,
      method: req.method,
      query: query
    });
    
    // Reconstruct the original path from query.path if it exists
    // Vercel rewrites /api/auth/register to /api?path=auth/register
    // We need to reconstruct it as /api/auth/register for Express
    if (query.path) {
      // Remove any leading slashes and reconstruct with /api prefix
      const cleanPath = query.path.replace(/^\/+/, '');
      req.url = `/api/${cleanPath}`;
      
      console.log("Reconstructed URL:", req.url);
    }
    
    // Simple health check (before DB connection for quick response)
    if (req.url === '/health' || req.url === '/' || req.url === '' || req.url === '/api') {
      return res.status(200).json({ 
        status: "ok",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
      });
    }
    
    // Ensure database connection for all other routes
    console.log("Ensuring database connection...");
    await ensureConnection();
    console.log("Database connected, forwarding to Express app");
    
    // Log incoming request
    console.log(`Forwarding: ${req.method} ${req.url}`);
    
    // Forward to Express app
    return app(req, res);
  } catch (error) {
    console.error("❌ API Error:", error);
    console.error("Error message:", error.message);
    console.error("Stack:", error.stack);
    return res.status(500).json({ 
      error: "Internal server error",
      message: error.message,
      details: process.env.NODE_ENV === 'production' ? 'Check function logs' : error.stack
    });
  }
};
