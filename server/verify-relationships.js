const db = require('./config/database');

async function verifyRelationships() {
  try {
    console.log('Verifying database relationships...\n');

    // Check schools
    const schools = await db('schools').select('id', 'name');
    console.log(`✓ Schools: ${schools.length} found`);
    if (schools.length > 0) {
      console.log(`  - ${schools[0].name} (ID: ${schools[0].id})`);
    }

    // Check roles
    const roles = await db('roles').select('id', 'name');
    console.log(`✓ Roles: ${roles.length} found`);

    // Check divisions
    const divisions = await db('divisions').select('id', 'name', 'school_id');
    console.log(`✓ Divisions: ${divisions.length} found`);
    if (divisions.length > 0) {
      const schoolExists = schools.some(s => s.id === divisions[0].school_id);
      console.log(`  - Division school_id reference: ${schoolExists ? 'VALID' : 'INVALID'}`);
    }

    // Check grades
    const grades = await db('grades').select('id', 'name', 'division_id');
    console.log(`✓ Grades: ${grades.length} found`);
    if (grades.length > 0) {
      const divisionExists = divisions.some(d => d.id === grades[0].division_id);
      console.log(`  - Grade division_id reference: ${divisionExists ? 'VALID' : 'INVALID'}`);
    }

    // Check users
    const users = await db('users').select('id', 'email', 'role_id', 'school_id');
    console.log(`✓ Users: ${users.length} found`);
    if (users.length > 0) {
      const roleExists = roles.some(r => r.id === users[0].role_id);
      const schoolExists = schools.some(s => s.id === users[0].school_id);
      console.log(`  - User role_id reference: ${roleExists ? 'VALID' : 'INVALID'}`);
      console.log(`  - User school_id reference: ${schoolExists ? 'VALID' : 'INVALID'}`);
    }

    // Check teachers
    const teachers = await db('teachers').select('id', 'user_id', 'school_id');
    console.log(`✓ Teachers: ${teachers.length} found`);
    if (teachers.length > 0) {
      const userExists = users.some(u => u.id === teachers[0].user_id);
      const schoolExists = schools.some(s => s.id === teachers[0].school_id);
      console.log(`  - Teacher user_id reference: ${userExists ? 'VALID' : 'INVALID'}`);
      console.log(`  - Teacher school_id reference: ${schoolExists ? 'VALID' : 'INVALID'}`);
    }

    // Check students
    const students = await db('students').select('id', 'user_id', 'grade_id', 'division_id', 'school_id');
    console.log(`✓ Students: ${students.length} found`);
    if (students.length > 0) {
      const userExists = users.some(u => u.id === students[0].user_id);
      const gradeExists = grades.some(g => g.id === students[0].grade_id);
      const divisionExists = divisions.some(d => d.id === students[0].division_id);
      const schoolExists = schools.some(s => s.id === students[0].school_id);
      console.log(`  - Student user_id reference: ${userExists ? 'VALID' : 'INVALID'}`);
      console.log(`  - Student grade_id reference: ${gradeExists ? 'VALID' : 'INVALID'}`);
      console.log(`  - Student division_id reference: ${divisionExists ? 'VALID' : 'INVALID'}`);
      console.log(`  - Student school_id reference: ${schoolExists ? 'VALID' : 'INVALID'}`);
    }

    // Check classes
    const classes = await db('classes').select('id', 'school_id', 'grade_id');
    console.log(`✓ Classes: ${classes.length} found`);
    if (classes.length > 0) {
      const schoolExists = schools.some(s => s.id === classes[0].school_id);
      const gradeExists = grades.some(g => g.id === classes[0].grade_id);
      console.log(`  - Class school_id reference: ${schoolExists ? 'VALID' : 'INVALID'}`);
      console.log(`  - Class grade_id reference: ${gradeExists ? 'VALID' : 'INVALID'}`);
    }

    // Check subjects
    const subjects = await db('subjects').select('id', 'school_id');
    console.log(`✓ Subjects: ${subjects.length} found`);
    if (subjects.length > 0) {
      const schoolExists = schools.some(s => s.id === subjects[0].school_id);
      console.log(`  - Subject school_id reference: ${schoolExists ? 'VALID' : 'INVALID'}`);
    }

    // Check parents
    const parents = await db('parents').select('id', 'user_id', 'school_id');
    console.log(`✓ Parents: ${parents.length} found`);
    if (parents.length > 0) {
      const userExists = users.some(u => u.id === parents[0].user_id);
      const schoolExists = schools.some(s => s.id === parents[0].school_id);
      console.log(`  - Parent user_id reference: ${userExists ? 'VALID' : 'INVALID'}`);
      console.log(`  - Parent school_id reference: ${schoolExists ? 'VALID' : 'INVALID'}`);
    }

    // Check parent-student relationships
    const relationships = await db('parent_student_relationships').select('id', 'parent_id', 'student_id');
    console.log(`✓ Parent-Student Relationships: ${relationships.length} found`);
    if (relationships.length > 0) {
      const parentExists = parents.some(p => p.id === relationships[0].parent_id);
      const studentExists = students.some(s => s.id === relationships[0].student_id);
      console.log(`  - Relationship parent_id reference: ${parentExists ? 'VALID' : 'INVALID'}`);
      console.log(`  - Relationship student_id reference: ${studentExists ? 'VALID' : 'INVALID'}`);
    }

    // Check attendance
    const attendance = await db('attendance').select('id', 'student_id', 'class_id', 'school_id');
    console.log(`✓ Attendance records: ${attendance.length} found`);
    if (attendance.length > 0) {
      const studentExists = students.some(s => s.id === attendance[0].student_id);
      const classExists = classes.some(c => c.id === attendance[0].class_id);
      const schoolExists = schools.some(s => s.id === attendance[0].school_id);
      console.log(`  - Attendance student_id reference: ${studentExists ? 'VALID' : 'INVALID'}`);
      console.log(`  - Attendance class_id reference: ${classExists ? 'VALID' : 'INVALID'}`);
      console.log(`  - Attendance school_id reference: ${schoolExists ? 'VALID' : 'INVALID'}`);
    }

    console.log('\n✅ Database relationship verification complete!');
  } catch (error) {
    console.error('❌ Error verifying relationships:', error.message);
  } finally {
    await db.destroy();
  }
}

verifyRelationships();
