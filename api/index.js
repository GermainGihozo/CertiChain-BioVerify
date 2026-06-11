// Vercel serverless function entry point (root level)
require("dotenv").config({ path: "../backend/.env" });
const app = require("../backend/src/app");
const connectDB = require("../backend/src/config/database");

let isConnected = false;

// Connect to database once
async function ensureConnection() {
  if (!isConnected) {
    await connectDB();
    isConnected = true;
  }
}

// Export the Express app as a serverless function
module.exports = async (req, res) => {
  try {
    await ensureConnection();
    return app(req, res);
  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
