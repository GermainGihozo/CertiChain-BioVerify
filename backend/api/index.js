// Vercel serverless function entry point
require("dotenv").config();
const app = require("../src/app");
const connectDB = require("../src/config/database");

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
  await ensureConnection();
  return app(req, res);
};
