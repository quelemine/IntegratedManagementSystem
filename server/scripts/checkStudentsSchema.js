require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const db = require('../config/database');

async function checkStudentsSchema() {
  try {
    console.log('Checking students table schema...\n');
    
    const columns = await db.raw(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'students' 
      AND table_schema = 'public'
      ORDER BY ordinal_position;
    `);
    console.log('Students table columns:');
    columns.rows.forEach(col => {
      console.log(`- ${col.column_name} (${col.data_type})`);
    });
    
    // Check a sample student record
    const sampleStudent = await db('students').limit(1).first();
    console.log('\nSample student record:', sampleStudent);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkStudentsSchema();
