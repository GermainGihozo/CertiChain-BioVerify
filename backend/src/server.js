require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/database");
const logger = require("./config/logger");

const PORT = process.env.PORT || 5000;

async function start() {
  await connectDB();

  app.listen(PORT, () => {
    logger.info(`🚀 CertChain API running on port ${PORT}`);
    logger.info(`   Environment: ${process.env.NODE_ENV || "development"}`);
  });
}

start().catch((err) => {
  logger.error("Failed to start server:", err);
  process.exit(1);
});
