const bcrypt = require('bcryptjs');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
  const hashedPassword = await bcrypt.hash('Password123!', 10);
  
  const schoolId = process.env.SEED_SCHOOL_ID || (await knex('schools').first('id')).id;
  const principalRoleId = process.env.SEED_ROLE_PRINCIPAL_ID || (await knex('roles').where('name', 'principal').first('id')).id;
  const teacherRoleId = process.env.SEED_ROLE_TEACHER_ID || (await knex('roles').where('name', 'teacher').first('id')).id;
  const parentRoleId = process.env.SEED_ROLE_PARENT_ID || (await knex('roles').where('name', 'parent').first('id')).id;
  const staffRoleId = process.env.SEED_ROLE_STAFF_ID || (await knex('roles').where('name', 'staff').first('id')).id;
  
  // Principals
  await knex('users').insert([
    {
      school_id: schoolId,
      email: 'principal.elementary@simtechinstitute.edu',
      password: hashedPassword,
      role_id: principalRoleId,
      first_name: 'Sarah',
      last_name: 'Johnson',
      phone: '+231880857970',
      is_active: true
    },
    {
      school_id: schoolId,
      email: 'principal.senior@simtechinstitute.edu',
      password: hashedPassword,
      role_id: principalRoleId,
      first_name: 'James',
      last_name: 'Williams',
      phone: '+231880857971',
      is_active: true
    }
  ]);
  
  // Teachers
  const teachers = [
    { first: 'Mary', last: 'Brown', subject: 'English' },
    { first: 'John', last: 'Davis', subject: 'Mathematics' },
    { first: 'Emily', last: 'Miller', subject: 'Science' },
    { first: 'Michael', last: 'Wilson', subject: 'Social Studies' },
    { first: 'Lisa', last: 'Taylor', subject: 'ICT' }
  ];
  
  for (let i = 0; i < teachers.length; i++) {
    await knex('users').insert({
      school_id: schoolId,
      email: `teacher.${teachers[i].first.toLowerCase()}@simtechinstitute.edu`,
      password: hashedPassword,
      role_id: teacherRoleId,
      first_name: teachers[i].first,
      last_name: teachers[i].last,
      phone: `+231880857${972 + i}`,
      is_active: true
    });
  }
  
  // Parents
  for (let i = 0; i < 10; i++) {
    await knex('users').insert({
      school_id: schoolId,
      email: `parent${i + 1}@simtechinstitute.edu`,
      password: hashedPassword,
      role_id: parentRoleId,
      first_name: `Parent${i + 1}`,
      last_name: `Surname${i + 1}`,
      phone: `+231880857${977 + i}`,
      is_active: true
    });
  }
  
  // Staff
  await knex('users').insert([
    {
      school_id: schoolId,
      email: 'accountant@simtechinstitute.edu',
      password: hashedPassword,
      role_id: staffRoleId,
      first_name: 'Robert',
      last_name: 'Anderson',
      phone: '+231880857987',
      is_active: true
    },
    {
      school_id: schoolId,
      email: 'security@simtechinstitute.edu',
      password: hashedPassword,
      role_id: staffRoleId,
      first_name: 'David',
      last_name: 'Thomas',
      phone: '+231880857988',
      is_active: true
    },
    {
      school_id: schoolId,
      email: 'admin.staff@simtechinstitute.edu',
      password: hashedPassword,
      role_id: staffRoleId,
      first_name: 'Jennifer',
      last_name: 'White',
      phone: '+231880857989',
      is_active: true
    }
  ]);
};
