/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
  // Get existing data
  const schools = await knex('schools').select('id').limit(1);
  const classes = await knex('classes').select('id').limit(1);
  const students = await knex('students').select('id').limit(5);
  const teachers = await knex('teachers').select('id').limit(2);
  const courses = await knex('courses').select('id').limit(2);

  if (schools.length === 0 || classes.length === 0 || students.length === 0) {
    console.log('Skipping academic data seed - missing prerequisite data');
    return;
  }

  const schoolId = schools[0].id;
  const classId = classes[0].id;
  const studentIds = students.map(s => s.id);
  const teacherIds = teachers.map(t => t.id);
  const courseIds = courses.map(c => c.id);

  // Insert sample attendance records
  const attendanceStatuses = ['present', 'absent', 'late', 'excused'];
  const attendanceData = [];
  
  for (let i = 0; i < 20; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    studentIds.forEach(studentId => {
      attendanceData.push({
        id: knex.raw('gen_random_uuid()'),
        school_id: schoolId,
        student_id: studentId,
        class_id: classId,
        date: dateStr,
        status: attendanceStatuses[Math.floor(Math.random() * attendanceStatuses.length)],
        remarks: Math.random() > 0.7 ? 'Note' : null,
        recorded_by: null
      });
    });
  }

  await knex('attendance').insert(attendanceData);
  console.log('Inserted sample attendance records');

  // Insert sample assignments
  if (courseIds.length > 0 && teacherIds.length > 0) {
    const assignmentData = [
      {
        id: knex.raw('gen_random_uuid()'),
        school_id: schoolId,
        course_id: courseIds[0],
        teacher_id: teacherIds[0],
        title: 'Mathematics Homework 1',
        description: 'Complete exercises 1-10 from Chapter 3',
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        total_points: 100,
        attachments: JSON.stringify([{ name: 'homework1.pdf', url: '/uploads/homework1.pdf' }])
      },
      {
        id: knex.raw('gen_random_uuid()'),
        school_id: schoolId,
        course_id: courseIds[0],
        teacher_id: teacherIds[0],
        title: 'Science Project',
        description: 'Create a presentation about renewable energy',
        due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        total_points: 150,
        attachments: null
      },
      {
        id: knex.raw('gen_random_uuid()'),
        school_id: schoolId,
        course_id: courseIds[1] || courseIds[0],
        teacher_id: teacherIds[1] || teacherIds[0],
        title: 'History Essay',
        description: 'Write a 500-word essay on World War II',
        due_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        total_points: 100,
        attachments: null
      }
    ];

    await knex('assignments').insert(assignmentData);
    console.log('Inserted sample assignments');
  }

  // Insert sample quizzes
  if (courseIds.length > 0 && teacherIds.length > 0) {
    const quizData = [
      {
        id: knex.raw('gen_random_uuid()'),
        school_id: schoolId,
        course_id: courseIds[0],
        teacher_id: teacherIds[0],
        title: 'Math Quiz 1',
        description: 'Chapter 1-2 review quiz',
        duration: 30,
        total_questions: 20,
        total_points: 100,
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        shuffle_questions: false,
        show_results_immediately: true
      },
      {
        id: knex.raw('gen_random_uuid()'),
        school_id: schoolId,
        course_id: courseIds[1] || courseIds[0],
        teacher_id: teacherIds[1] || teacherIds[0],
        title: 'Science Quiz',
        description: 'Biology fundamentals',
        duration: 45,
        total_questions: 25,
        total_points: 100,
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        shuffle_questions: true,
        show_results_immediately: false
      }
    ];

    await knex('quizzes').insert(quizData);
    console.log('Inserted sample quizzes');
  }

  // Insert sample student grades
  if (courseIds.length > 0) {
    const gradeTypes = ['assignment', 'quiz', 'exam', 'project'];
    const letterGrades = ['A', 'B', 'C', 'D', 'F'];
    const gradeData = [];

    studentIds.forEach(studentId => {
      courseIds.forEach(courseId => {
        for (let i = 0; i < 3; i++) {
          const score = Math.floor(Math.random() * 40) + 60; // 60-100
          const totalPoints = 100;
          const percentage = (score / totalPoints) * 100;
          let letterGrade = 'F';
          if (percentage >= 90) letterGrade = 'A';
          else if (percentage >= 80) letterGrade = 'B';
          else if (percentage >= 70) letterGrade = 'C';
          else if (percentage >= 60) letterGrade = 'D';

          gradeData.push({
            id: knex.raw('gen_random_uuid()'),
            school_id: schoolId,
            student_id: studentId,
            course_id: courseId,
            assignment_id: null,
            quiz_id: null,
            exam_id: null,
            grade_type: gradeTypes[Math.floor(Math.random() * gradeTypes.length)],
            score: score,
            total_points: totalPoints,
            letter_grade: letterGrade,
            remarks: Math.random() > 0.8 ? 'Good effort' : null,
            term: ['Fall', 'Spring', 'Summer'][Math.floor(Math.random() * 3)],
            academic_year: '2024-2025',
            graded_by: null
          });
        }
      });
    });

    await knex('student_grades').insert(gradeData);
    console.log('Inserted sample student grades');
  }

  console.log('Academic data seeded successfully');
};
