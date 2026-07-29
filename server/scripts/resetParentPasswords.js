/**
 * Script to reset all parent user passwords to "1234"
 * Usage: node server/scripts/resetParentPasswords.js
 * 
 * This script is specifically for resetting parent passwords on production
 * when they were not included in the general password reset.
 */

const db = require('../config/database');
const bcrypt = require('bcryptjs');

const resetParentPasswords = async () => {
  try {
    console.log('=== Resetting Parent Passwords ===\n');
    
    // Hash the default password "1234"
    const defaultPassword = '1234';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);
    
    console.log(`Default password: ${defaultPassword}`);
    console.log(`Hashed password: ${hashedPassword}\n`);
    
    // Get all parent users
    const parentRole = await db('roles').where('name', 'parent').first();
    
    if (!parentRole) {
      console.log('❌ Parent role not found');
      process.exit(1);
    }
    
    const parents = await db('users')
      .select('id', 'email', 'password')
      .where('role_id', parentRole.id);
    
    console.log(`Found ${parents.length} parent users in the database.\n`);
    
    if (parents.length === 0) {
      console.log('No parent users found. Exiting.');
      process.exit(0);
    }
    
    // Update all parent passwords
    let updatedCount = 0;
    
    for (const parent of parents) {
      await db('users')
        .where('id', parent.id)
        .update({ password: hashedPassword });
      
      updatedCount++;
      console.log(`✅ Updated password for: ${parent.email}`);
    }
    
    console.log('\n=== Parent Password Reset Complete ===');
    console.log(`Total parent users updated: ${updatedCount}`);
    console.log('\nAll parent passwords have been reset to: 1234');
    console.log('\nPlease test login with parent credentials.');
    
    process.exit(0);
  } catch (error) {
    console.error('Error resetting parent passwords:', error);
    process.exit(1);
  }
};

resetParentPasswords();
