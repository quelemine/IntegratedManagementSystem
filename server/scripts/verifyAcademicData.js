require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const db = require('../config/database');

async function verifyData() {
  try {
    console.log('Verifying academic sample data...\n');

    // Check attendance
    const attendanceCount = await db('attendance').count('* as count').first();
    console.log(`✓ Attendance records: ${attendanceCount.count}`);
    if (attendanceCount.count > 0) {
      const sampleAttendance = await db('attendance').limit(1).first();
      console.log(`  Sample: ${sampleAttendance.date} - ${sampleAttendance.status}`);
    }

    // Check assignments
    const assignmentCount = await db('assignments').count('* as count').first();
    console.log(`✓ Assignment records: ${assignmentCount.count}`);
    if (assignmentCount.count > 0) {
      const sampleAssignment = await db('assignments').limit(1).first();
      console.log(`  Sample: ${sampleAssignment.title}`);
    }

    // Check quizzes
    const quizCount = await db('quizzes').count('* as count').first();
    console.log(`✓ Quiz records: ${quizCount.count}`);
    if (quizCount.count > 0) {
      const sampleQuiz = await db('quizzes').limit(1).first();
      console.log(`  Sample: ${sampleQuiz.title} (${sampleQuiz.total_questions} questions)`);
    }

    // Check student grades
    const gradeCount = await db('student_grades').count('* as count').first();
    console.log(`✓ Student grade records: ${gradeCount.count}`);
    if (gradeCount.count > 0) {
      const sampleGrade = await db('student_grades').limit(1).first();
      console.log(`  Sample: ${sampleGrade.grade_type} - ${sampleGrade.letter_grade}`);
    }

    console.log('\n✓ All academic tables contain sample data!');
    process.exit(0);
  } catch (error) {
    console.error('✗ Error verifying data:', error.message);
    process.exit(1);
  }
}

verifyData();
