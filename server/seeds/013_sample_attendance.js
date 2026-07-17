/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
  await knex('attendance').del();
  
  const schoolId = process.env.SEED_SCHOOL_ID || (await knex('schools').first('id')).id;
  
  // Get students and classes
  const students = await knex('students').limit(20).select('id', 'class_id');
  const classes = await knex('classes').select('id');
  
  // Get a teacher user for recorded_by
  const teacherUser = await knex('users').where('email', 'like', 'teacher.%').first('id');
  
  // Generate sample attendance records for the past 30 days
  const statuses = ['present', 'present', 'present', 'present', 'absent', 'late', 'excused'];
  
  for (let day = 0; day < 30; day++) {
    const date = new Date();
    date.setDate(date.getDate() - day);
    
    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    
    for (const student of students) {
      if (!student.class_id) continue;
      
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      await knex('attendance').insert({
        school_id: schoolId,
        student_id: student.id,
        class_id: student.class_id,
        date: date.toISOString().split('T')[0],
        status: status,
        recorded_by: teacherUser ? teacherUser.id : null
      });
    }
  }
};
