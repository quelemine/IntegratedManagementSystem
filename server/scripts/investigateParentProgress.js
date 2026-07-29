/**
 * Script to investigate parent progress loading issue
 * Usage: node server/scripts/investigateParentProgress.js
 */

const db = require('../config/database');

const investigateParentProgress = async () => {
  try {
    console.log('=== Parent Progress Loading Investigation ===\n');
    
    // Check parent user
    const parentUser = await db('users')
      .select('id', 'email', 'role_id')
      .where('email', 'parent1@simtechinstitute.edu')
      .first();
    
    if (!parentUser) {
      console.log('❌ Parent user not found');
      process.exit(1);
    }
    
    console.log('Parent User:', parentUser.email, 'ID:', parentUser.id);
    
    // Get parent record
    const parent = await db('parents')
      .select('id', 'user_id')
      .where('user_id', parentUser.id)
      .first();
    
    if (!parent) {
      console.log('❌ Parent record not found in parents table');
      process.exit(1);
    }
    
    console.log('Parent Record ID:', parent.id);
    
    // Check parent-child relationships
    const relationships = await db('parent_student_relationships')
      .select('id', 'parent_id', 'student_id', 'relationship_type', 'is_primary')
      .where('parent_id', parent.id);
    
    console.log('\nParent-Child Relationships:', relationships.length);
    
    if (relationships.length === 0) {
      console.log('❌ No parent-child relationships found - this is the issue!');
    } else {
      relationships.forEach((rel, idx) => {
        console.log(`  ${idx + 1}. Student ID: ${rel.student_id}, Type: ${rel.relationship_type}, Primary: ${rel.is_primary}`);
      });
    }
    
    // Check if students exist
    if (relationships.length > 0) {
      for (const rel of relationships) {
        const student = await db('students')
          .select('students.id', 'students.student_id', 'users.first_name', 'users.last_name')
          .join('users', 'students.user_id', 'users.id')
          .where('students.id', rel.student_id)
          .first();
        
        if (student) {
          console.log(`\nStudent: ${student.first_name} ${student.last_name} (${student.student_id})`);
          
          // Check grades for this student
          const grades = await db('student_grades')
            .select('id', 'course_id', 'score', 'grade_type')
            .where('student_id', student.id);
          
          console.log(`  Grades found: ${grades.length}`);
          
          if (grades.length === 0) {
            console.log('  ❌ No grades found for this student');
          } else {
            grades.forEach((grade, idx) => {
              console.log(`    ${idx + 1}. Course: ${grade.course_id}, Score: ${grade.score}, Type: ${grade.grade_type}`);
            });
          }
        } else {
          console.log(`\n❌ Student not found for relationship student_id: ${rel.student_id}`);
        }
      }
    }
    
    // Check total students in database
    const totalStudents = await db('students').count('* as count').first();
    console.log(`\nTotal students in database: ${totalStudents.count}`);
    
    // Check total grades in database
    const totalGrades = await db('student_grades').count('* as count').first();
    console.log(`Total grades in database: ${totalGrades.count}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error investigating parent progress:', error);
    process.exit(1);
  }
};

investigateParentProgress();
