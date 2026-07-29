/**
 * Script to test password hash verification
 * Usage: node server/scripts/testPasswordHash.js
 */

const db = require('../config/database');
const bcrypt = require('bcryptjs');

const testPasswords = async () => {
  try {
    console.log('Testing password hash verification...\n');
    
    const testEmails = [
      'admin@simtechinstitute.edu',
      'parent1@simtechinstitute.edu',
      'teacher.john@simtechinstitute.edu',
      'student1@simtechinstitute.edu'
    ];
    
    const testPassword = '1234';
    
    for (const email of testEmails) {
      console.log(`Testing user: ${email}`);
      
      const user = await db('users')
        .select('id', 'email', 'password', 'is_active')
        .where('email', email)
        .first();
      
      if (!user) {
        console.log(`  ❌ User not found\n`);
        continue;
      }
      
      console.log(`  User ID: ${user.id}`);
      console.log(`  Is Active: ${user.is_active}`);
      console.log(`  Password Hash: ${user.password.substring(0, 30)}...`);
      
      const isValid = await bcrypt.compare(testPassword, user.password);
      console.log(`  Password "1234" matches: ${isValid ? '✅ YES' : '❌ NO'}\n`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error testing passwords:', error);
    process.exit(1);
  }
};

testPasswords();
