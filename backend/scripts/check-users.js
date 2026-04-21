/**
 * Script to check existing users in the database
 * Run: node backend/scripts/check-users.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../src/models/User');

async function checkUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const users = await User.find({}).select('+password');
    
    console.log(`📊 Total users: ${users.length}\n`);
    
    if (users.length === 0) {
      console.log('❌ No users found in database!');
      console.log('\nTo create an admin user, run:');
      console.log('node backend/scripts/create-admin.js\n');
    } else {
      console.log('Users in database:');
      console.log('─'.repeat(80));
      users.forEach((user, i) => {
        console.log(`${i + 1}. ${user.fullName}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Active: ${user.isActive}`);
        console.log(`   Has Password: ${!!user.password}`);
        console.log(`   Wallet: ${user.walletAddress || 'Not set'}`);
        console.log(`   Last Login: ${user.lastLogin || 'Never'}`);
        console.log('');
      });
    }

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkUsers();
