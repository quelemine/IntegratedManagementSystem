/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
  const schoolId = process.env.SEED_SCHOOL_ID || (await knex('schools').first('id')).id;
  
  // Get students and courses
  const students = await knex('students').limit(15).select('id');
  let courses = await knex('courses').select('id');
  
  // Get a teacher user for graded_by
  const teacherUser = await knex('users').where('email', 'like', 'teacher.%').first('id');
  
  if (courses.length === 0) {
    // Create some sample courses first
    const subjects = await knex('subjects').limit(5).select('id', 'name');
    const grades = await knex('grades').limit(3).select('id', 'name');
    const teachers = await knex('teachers').limit(3).select('id');
    
    for (let i = 0; i < subjects.length; i++) {
      for (let j = 0; j < grades.length; j++) {
        await knex('courses').insert({
          school_id: schoolId,
          subject_id: subjects[i].id,
          grade_id: grades[j].id,
          teacher_id: teachers[i % teachers.length].id,
          name: `${subjects[i].name} - ${grades[j].name}`,
          academic_year: '2024-2025'
        });
      }
    }
    
    // Get courses again
    courses = await knex('courses').select('id');
  }
  
  // Get existing student grades to avoid duplicates
  const existingGrades = await knex('student_grades').select('student_id', 'course_id');
  const existingKeys = existingGrades.map(g => `${g.student_id}-${g.course_id}`);
  
  // Generate sample grades
  let newGradesCount = 0;
  for (const student of students) {
    for (const course of courses) {
      const key = `${student.id}-${course.id}`;
      if (existingKeys.includes(key)) continue;
      
      const score = Math.floor(Math.random() * 30) + 70; // 70-100
      let letterGrade = 'A';
      if (score < 80) letterGrade = 'B';
      if (score < 70) letterGrade = 'C';
      if (score < 60) letterGrade = 'D';
      if (score < 50) letterGrade = 'F';
      
      await knex('student_grades').insert({
        school_id: schoolId,
        student_id: student.id,
        course_id: course.id,
        grade_type: 'assignment',
        score: score,
        total_points: 100,
        letter_grade: letterGrade,
        term: 'Term 1',
        academic_year: '2024-2025',
        graded_by: teacherUser ? teacherUser.id : null
      });
      
      newGradesCount++;
    }
  }
  
  console.log(`Processed ${newGradesCount} new student grades`);
};
