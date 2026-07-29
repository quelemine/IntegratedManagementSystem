/**
 * Reset Admin Password Script
 * Run this in production to reset the super_admin password
 * Usage: node server/scripts/resetAdminPassword.js
 */

const db = require('../config/database');
const bcrypt = require('bcryptjs');

async function resetAdminPassword() {
  try {
    console.log('Resetting admin password...');
    
    // Find the admin user
    const admin = await db('users')
      .where('email', 'admin@simtechinstitute.edu')
      .first();
    
    if (!admin) {
      console.error('Admin user not found!');
      process.exit(1);
    }
    
    console.log('Found admin user:', admin.email);
    
    // Hash new password
    const newPassword = '1234';
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    console.log('Updating password...');
    
    // Update password
    await db('users')
      .where('email', 'admin@simtechinstitute.edu')
      .update({ 
        password: hashedPassword,
        is_active: true
      });
    
    console.log('✓ Admin password reset successfully!');
    console.log('Email: admin@simtechinstitute.edu');
    console.log('Password: 1234');
    
    process.exit(0);
  } catch (error) {
    console.error('Error resetting password:', error);
    process.exit(1);
  }
}

resetAdminPassword();
