/**
 * Script to seed test users for all roles
 * Run: node backend/scripts/seed-users.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../src/models/User');
const Institution = require('../src/models/Institution');

const testUsers = [
  {
    fullName: 'System Administrator',
    email: 'admin@certchain.com',
    password: 'admin123456',
    role: 'admin',
    walletAddress: '0xf39fd6e51aad88f6f4ce6ab8827279cffb92266',
  },
  {
    fullName: 'John Doe',
    email: 'student@test.com',
    password: 'student123',
    role: 'student',
    studentId: 'STU2024001',
    walletAddress: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
  },
  {
    fullName: 'Jane Smith',
    email: 'student2@test.com',
    password: 'student123',
    role: 'student',
    studentId: 'STU2024002',
    walletAddress: '0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc',
  },
];

async function seedUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Create test institution first
    let institution = await Institution.findOne({ email: 'institution@test.com' });
    
    if (!institution) {
      institution = await Institution.create({
        name: 'Test University',
        shortName: 'TU',
        email: 'institution@test.com',
        walletAddress: '0x90f79bf6eb2c4f870365e785982e1f101e93b906',
        country: 'Rwanda',
        city: 'Kigali',
        isActive: true,
        registeredOnChain: false,
      });
      console.log('✅ Test institution created');
    }

    // Add institution user
    const institutionUser = {
      fullName: 'Institution Admin',
      email: 'institution@test.com',
      password: 'institution123',
      role: 'institution',
      institutionId: institution._id,
      walletAddress: '0x90f79bf6eb2c4f870365e785982e1f101e93b906',
    };

    console.log('Creating test users...\n');
    
    for (const userData of [...testUsers, institutionUser]) {
      const existing = await User.findOne({ email: userData.email });
      
      if (existing) {
        console.log(`⚠️  User already exists: ${userData.email}`);
        
        // Ensure user is active
        if (!existing.isActive) {
          existing.isActive = true;
          await existing.save();
          console.log(`   ✅ Reactivated user`);
        }
      } else {
        await User.create(userData);
        console.log(`✅ Created: ${userData.email} (${userData.role})`);
      }
    }

    console.log('\n' + '─'.repeat(70));
    console.log('Test Login Credentials:');
    console.log('─'.repeat(70));
    console.log('\n👤 ADMIN:');
    console.log('   Email: admin@certchain.com');
    console.log('   Password: admin123456');
    console.log('\n🏛️  INSTITUTION:');
    console.log('   Email: institution@test.com');
    console.log('   Password: institution123');
    console.log('\n🎓 STUDENT 1:');
    console.log('   Email: student@test.com');
    console.log('   Password: student123');
    console.log('\n🎓 STUDENT 2:');
    console.log('   Email: student2@test.com');
    console.log('   Password: student123');
    console.log('\n' + '─'.repeat(70));
    console.log('\n⚠️  IMPORTANT: Change passwords in production!\n');

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

seedUsers();
