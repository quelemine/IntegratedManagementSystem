require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const db = require('../config/database');

async function checkAttendanceSchema() {
  try {
    console.log('Checking attendance table schema...\n');
    
    const columns = await db.raw(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'attendance' 
      AND table_schema = 'public'
      ORDER BY ordinal_position;
    `);
    console.log('Attendance table columns:');
    columns.rows.forEach(col => {
      console.log(`- ${col.column_name} (${col.data_type})`);
    });
    
    // Check a sample attendance record
    const sampleAttendance = await db('attendance').limit(1).first();
    console.log('\nSample attendance record:', sampleAttendance);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkAttendanceSchema();
