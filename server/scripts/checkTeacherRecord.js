/**
 * Script to check if teacher record exists
 * Usage: node server/scripts/checkTeacherRecord.js
 */

const db = require('../config/database');

const checkTeacherRecord = async () => {
  try {
    console.log('=== Checking Teacher Record ===\n');
    
    const teacherEmail = 'teacher.john@simtechinstitute.edu';
    
    // Get user
    const user = await db('users')
      .select('id', 'email', 'role_id')
      .where('email', teacherEmail)
      .first();
    
    if (!user) {
      console.log('❌ User not found');
      process.exit(1);
    }
    
    console.log('User:', user.email, 'ID:', user.id);
    
    // Get teacher record
    const teacher = await db('teachers')
      .select('id', 'user_id', 'school_id')
      .where('user_id', user.id)
      .first();
    
    if (!teacher) {
      console.log('❌ Teacher record not found - this is the issue!');
      console.log('Need to create teacher record for user_id:', user.id);
    } else {
      console.log('✅ Teacher record found:', teacher.id);
    }
    
    // Check all teachers
    const allTeachers = await db('teachers').select('*');
    console.log('\nTotal teachers in database:', allTeachers.length);
    allTeachers.forEach((t, idx) => {
      console.log(`  ${idx + 1}. ID: ${t.id}, User ID: ${t.user_id}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkTeacherRecord();
