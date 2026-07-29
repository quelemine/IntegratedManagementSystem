/**
 * Script to investigate parent login issue
 * Usage: node server/scripts/investigateParentLogin.js
 */

const db = require('../config/database');
const bcrypt = require('bcryptjs');

const investigateParentLogin = async () => {
  try {
    console.log('=== Parent Login Investigation ===\n');
    
    const testEmails = [
      'admin@simtechinstitute.edu',
      'parent1@simtechinstitute.edu',
      'parent2@simtechinstitute.edu',
      'parent3@simtechinstitute.edu'
    ];
    
    const testPassword = '1234';
    
    for (const email of testEmails) {
      console.log(`--- Investigating: ${email} ---`);
      
      const user = await db('users')
        .select('id', 'email', 'password', 'is_active', 'role_id')
        .where('email', email)
        .first();
      
      if (!user) {
        console.log(`  ❌ User not found\n`);
        continue;
      }
      
      // Get role name
      const role = await db('roles')
        .select('name')
        .where('id', user.role_id)
        .first();
      
      console.log(`  User ID: ${user.id}`);
      console.log(`  Role: ${role ? role.name : 'Unknown'}`);
      console.log(`  Is Active: ${user.is_active}`);
      console.log(`  Password Hash: ${user.password.substring(0, 40)}...`);
      
      const isValid = await bcrypt.compare(testPassword, user.password);
      console.log(`  Password "1234" matches: ${isValid ? '✅ YES' : '❌ NO'}`);
      
      // Check login attempts
      const loginAttempts = await db('login_attempts')
        .where('email', email)
        .orderBy('created_at', 'desc')
        .limit(5);
      
      console.log(`  Recent login attempts: ${loginAttempts.length}`);
      loginAttempts.forEach((attempt, idx) => {
        console.log(`    ${idx + 1}. ${attempt.created_at} - Success: ${attempt.success} - ${attempt.failure_reason || 'Success'}`);
      });
      
      console.log();
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error investigating parent login:', error);
    process.exit(1);
  }
};

investigateParentLogin();
