require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const db = require('../config/database');

async function checkSchema() {
  try {
    console.log('Checking users table schema...');
    const columns = await db.raw(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND table_schema = 'public'
      ORDER BY ordinal_position;
    `);
    console.log('Users table columns:', columns.rows);
    
    console.log('\nChecking teachers table...');
    const teachers = await db.raw(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'teachers' 
      AND table_schema = 'public'
      ORDER BY ordinal_position;
    `);
    console.log('Teachers table columns:', teachers.rows);
    
    console.log('\nChecking courses table...');
    const courses = await db.raw(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'courses' 
      AND table_schema = 'public'
      ORDER BY ordinal_position;
    `);
    console.log('Courses table columns:', courses.rows);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkSchema();
