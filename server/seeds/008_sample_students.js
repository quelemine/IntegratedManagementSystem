const bcrypt = require('bcryptjs');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
  await knex('students').del();
  
  const hashedPassword = await bcrypt.hash('Student123!', 10);
  
  const schoolId = process.env.SEED_SCHOOL_ID || (await knex('schools').first('id')).id;
  const studentRoleId = process.env.SEED_ROLE_STUDENT_ID || (await knex('roles').where('name', 'student').first('id')).id;
  
  // Get grade IDs
  const grades = await knex('grades').select('id', 'code', 'name', 'division_id');
  
  // Create 20 sample students distributed across grades
  const students = [];
  let studentCounter = 1;
  
  for (const grade of grades) {
    // Create 2-3 students per grade
    const studentsPerGrade = grade.name.includes('Grade') ? 2 : 3;
    
    for (let i = 0; i < studentsPerGrade; i++) {
      // Generate student ID based on division and year
      const divisionCode = grade.code.split('-')[0];
      const studentNumber = String(studentCounter).padStart(4, '0');
      const generatedId = `${divisionCode}-2024-${studentNumber}`;
      
      // Create user account for student
      const userId = (await knex('users').insert({
        school_id: schoolId,
        email: `student${studentCounter}@simtechinstitute.edu`,
        password: hashedPassword,
        role_id: studentRoleId,
        first_name: `Student${studentCounter}`,
        last_name: `Name${studentCounter}`,
        phone: `+231880857${990 + studentCounter}`,
        is_active: true
      }).returning('id'))[0].id;
      
      students.push({
        user_id: userId,
        student_id: generatedId,
        grade_id: grade.id,
        division_id: grade.division_id,
        date_of_birth: '2010-01-15',
        gender: studentCounter % 2 === 0 ? 'F' : 'M',
        address: 'Gbarnga City, Bong County',
        enrollment_date: '2024-09-01',
        status: 'active'
      });
      
      studentCounter++;
    }
  }
  
  // Insert students
  for (const student of students) {
    await knex('students').insert({
      school_id: schoolId,
      ...student
    });
  }
};
