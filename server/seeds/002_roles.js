/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
  const roleNames = ['super_admin', 'principal', 'teacher', 'parent', 'student', 'tutor', 'staff'];
  
  // Check which roles already exist
  const existingRoles = await knex('roles').whereIn('name', roleNames).select('name', 'id');
  const existingRoleNames = existingRoles.map(r => r.name);
  
  const rolesToInsert = [
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
  ].filter(role => !existingRoleNames.includes(role.name));
  
  // Insert only new roles
  if (rolesToInsert.length > 0) {
    await knex('roles').insert(rolesToInsert);
  }
  
  // Get all roles (existing + newly inserted)
  const allRoles = await knex('roles').whereIn('name', roleNames).select('id', 'name');
  
  // Store role IDs for use in other seeds
  allRoles.forEach((role) => {
    process.env[`SEED_ROLE_${role.name.toUpperCase()}_ID`] = role.id;
  });
  
  console.log(`Processed ${allRoles.length} roles (${rolesToInsert.length} new)`);
};
