const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const authRoutes        = require("./routes/auth.routes");
const userRoutes        = require("./routes/user.routes");
const institutionRoutes = require("./routes/institution.routes");
const certificateRoutes = require("./routes/certificate.routes");
const verifyRoutes      = require("./routes/verify.routes");
const webauthnRoutes    = require("./routes/webauthn.routes");
const adminRoutes       = require("./routes/admin.routes");
const verificationRequestRoutes = require("./routes/verificationRequest.routes");
const blockchainTestRoutes = require("./routes/blockchain-test.routes");
const adminBlockchainRoutes = require("./routes/admin-blockchain.routes");

const errorHandler = require("./middleware/errorHandler");

const app = express();

// ─── Security ─────────────────────────────────────────────────────────────────
app.use(helmet());

// CORS Configuration
// If FRONTEND_URL is set and different from backend, use it
// Otherwise, allow same-origin (for monorepo deployments)
const frontendUrl = process.env.FRONTEND_URL;

if (frontendUrl && frontendUrl !== process.env.BACKEND_URL) {
  // Separate frontend and backend deployments
  const allowedOrigins = [
    frontendUrl,
    "http://localhost:3000",
    "http://localhost:5000",
  ].filter(Boolean);

  app.use(
    cors({
      origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1) {
          callback(null, true);
        } else {
          console.log(`CORS blocked origin: ${origin}`);
          console.log(`Allowed origins: ${allowedOrigins.join(", ")}`);
          callback(new Error("Not allowed by CORS"));
        }
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );
} else {
  // Monorepo deployment - same origin, allow all
  app.use(
    cors({
      origin: true, // Allow all origins for same-domain deployment
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );
}

// ─── Rate Limiting ────────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: "Too many requests, please try again later." },
});
app.use("/api/", limiter);

// ─── Body Parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

// ─── Logging ──────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== "test") {
  app.use(morgan("combined"));
}

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/auth",         authRoutes);
app.use("/api/users",        userRoutes);
app.use("/api/institutions", institutionRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/verify",       verifyRoutes);
app.use("/api/webauthn",     webauthnRoutes);
app.use("/api/admin",        adminRoutes);
app.use("/api/admin/blockchain", adminBlockchainRoutes);
app.use("/api/verification-requests", verificationRequestRoutes);
app.use("/api/blockchain",   blockchainTestRoutes);

// ─── 404 ──────────────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ─── Error Handler ────────────────────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
