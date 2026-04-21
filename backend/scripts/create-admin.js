/**
 * Script to create an admin user
 * Run: node backend/scripts/create-admin.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../src/models/User');

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@certchain.com' });
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Active: ${existingAdmin.isActive}`);
      
      if (!existingAdmin.isActive) {
        existingAdmin.isActive = true;
        await existingAdmin.save();
        console.log('✅ Admin user reactivated!');
      }
      
      await mongoose.disconnect();
      return;
    }

    // Create new admin user
    const admin = await User.create({
      fullName: 'System Administrator',
      email: 'admin@certchain.com',
      password: 'admin123456', // Change this in production!
      role: 'admin',
      walletAddress: '0xf39fd6e51aad88f6f4ce6ab8827279cffb92266', // Hardhat account #0
      isActive: true,
    });

    console.log('✅ Admin user created successfully!\n');
    console.log('Login credentials:');
    console.log('─'.repeat(50));
    console.log(`Email:    ${admin.email}`);
    console.log(`Password: admin123456`);
    console.log(`Role:     ${admin.role}`);
    console.log('─'.repeat(50));
    console.log('\n⚠️  IMPORTANT: Change the password after first login!\n');

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createAdmin();
