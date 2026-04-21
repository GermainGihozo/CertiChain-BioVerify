require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });

const mongoose = require("mongoose");
const User = require("../models/User");

const ADMIN = {
  fullName: "Super Admin",
  email: process.env.ADMIN_EMAIL || "admin@certichain.com",
  password: process.env.ADMIN_PASSWORD || "Admin@123456",
  role: "admin",
};

async function seed() {
  await mongoose.connect(
    process.env.MONGODB_URI || "mongodb://localhost:27017/certchain"
  );
  console.log("✅ Connected to MongoDB");

  const existing = await User.findOne({ email: ADMIN.email });
  if (existing) {
    console.log(`ℹ️  Admin already exists: ${ADMIN.email}`);
    await mongoose.disconnect();
    return;
  }

  await User.create(ADMIN);
  console.log(`🎉 Admin user created:`);
  console.log(`   Email   : ${ADMIN.email}`);
  console.log(`   Password: ${ADMIN.password}`);
  console.log(`   Role    : admin`);

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});
