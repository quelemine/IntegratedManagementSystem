require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const db = require('../config/database');

async function checkTeachersSchema() {
  try {
    console.log('Checking teachers table schema...\n');
    
    const columns = await db.raw(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'teachers' 
      AND table_schema = 'public'
      ORDER BY ordinal_position;
    `);
    console.log('Teachers table columns:');
    columns.rows.forEach(col => {
      console.log(`- ${col.column_name} (${col.data_type})`);
    });
    
    // Check a sample teacher record
    const sampleTeacher = await db('teachers').limit(1).first();
    console.log('\nSample teacher record:', sampleTeacher);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkTeachersSchema();
