/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
  await knex('roles').del();
  
  const roles = await knex('roles').insert([
    {
      name: 'super_admin',
      permissions: JSON.stringify(['all']),
      description: 'Full system access'
    },
    {
      name: 'principal',
      permissions: JSON.stringify(['division_manage', 'students_view', 'teachers_view', 'reports_view']),
      description: 'Division administrator'
    },
    {
      name: 'teacher',
      permissions: JSON.stringify(['classes_view', 'attendance_manage', 'grades_manage', 'materials_upload']),
      description: 'Classroom teacher'
    },
    {
      name: 'parent',
      permissions: JSON.stringify(['children_view', 'grades_view', 'attendance_view', 'payments_view']),
      description: 'Student parent/guardian'
    },
    {
      name: 'student',
      permissions: JSON.stringify(['courses_view', 'materials_view', 'assignments_submit', 'exams_take']),
      description: 'Enrolled student'
    },
    {
      name: 'tutor',
      permissions: JSON.stringify(['sessions_manage', 'materials_upload']),
      description: 'Private tutor'
    },
    {
      name: 'staff',
      permissions: JSON.stringify(['attendance_manage', 'tasks_view']),
      description: 'School staff member'
    }
  ]).returning('id');
  
  // Store role IDs for use in other seeds
  const roleNames = ['super_admin', 'principal', 'teacher', 'parent', 'student', 'tutor', 'staff'];
  roles.forEach((role, index) => {
    process.env[`SEED_ROLE_${roleNames[index].toUpperCase()}_ID`] = role.id;
  });
};
