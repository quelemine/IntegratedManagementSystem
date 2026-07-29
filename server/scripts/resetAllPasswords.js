/**
 * Script to reset all user passwords to "1234"
 * Usage: node server/scripts/resetAllPasswords.js
 */

const db = require('../config/database');
const bcrypt = require('bcryptjs');

const resetPasswords = async () => {
  try {
    console.log('Starting password reset process...');
    
    // Hash the default password "1234"
    const defaultPassword = '1234';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);
    
    console.log(`Default password: ${defaultPassword}`);
    console.log(`Hashed password: ${hashedPassword}`);
    
    // Get all users with their role names
    const users = await db('users')
      .select('users.id', 'users.email', 'roles.name as role')
      .join('roles', 'users.role_id', 'roles.id');
    
    console.log(`Found ${users.length} users in the database.`);
    
    // Update all users' passwords
    let updatedCount = 0;
    const rolesUpdated = {};
    
    for (const user of users) {
      await db('users')
        .where('id', user.id)
        .update({ password: hashedPassword });
      
      updatedCount++;
      
      // Track updates by role
      if (!rolesUpdated[user.role]) {
        rolesUpdated[user.role] = 0;
      }
      rolesUpdated[user.role]++;
      
      console.log(`Updated password for: ${user.email} (Role: ${user.role})`);
    }
    
    console.log('\n=== Password Reset Complete ===');
    console.log(`Total users updated: ${updatedCount}`);
    console.log('\nBreakdown by role:');
    Object.keys(rolesUpdated).forEach(role => {
      console.log(`  ${role}: ${rolesUpdated[role]}`);
    });
    console.log('\nAll passwords have been reset to: 1234');
    
    process.exit(0);
  } catch (error) {
    console.error('Error resetting passwords:', error);
    process.exit(1);
  }
};

// Run the script
resetPasswords();
