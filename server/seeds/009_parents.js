/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
  await knex('parents').del();
  await knex('parent_student_relationships').del();
  
  const schoolId = process.env.SEED_SCHOOL_ID || (await knex('schools').first('id')).id;
  const parentRoleId = process.env.SEED_ROLE_PARENT_ID || (await knex('roles').where('name', 'parent').first('id')).id;
  
  // Get parent users
  const parentUsers = await knex('users')
    .where('role_id', parentRoleId)
    .select('id');
  
  // Get students
  const students = await knex('students').select('id');
  
  // Create parent records
  const parentIds = [];
  for (let i = 0; i < parentUsers.length; i++) {
    const parentId = (await knex('parents').insert({
      school_id: schoolId,
      user_id: parentUsers[i].id,
      relationship: i % 2 === 0 ? 'Father' : 'Mother',
      occupation: 'Business',
      employer: 'Self-employed'
    }).returning('id'))[0].id;
    
    parentIds.push(parentId);
    
    // Link parents to students (2 children per parent)
    const studentIndex1 = (i * 2) % students.length;
    const studentIndex2 = (i * 2 + 1) % students.length;
    
    await knex('parent_student_relationships').insert([
      {
        parent_id: parentId,
        student_id: students[studentIndex1].id,
        is_primary: true
      },
      {
        parent_id: parentId,
        student_id: students[studentIndex2].id,
        is_primary: false
      }
    ]);
  }
};
