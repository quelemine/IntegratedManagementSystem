/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
  await knex('teachers').del();
  await knex('staff').del();
  
  const schoolId = process.env.SEED_SCHOOL_ID || (await knex('schools').first('id')).id;
  
  // Get teacher user IDs
  const teacherUsers = await knex('users')
    .where('email', 'like', 'teacher.%')
    .orderBy('email')
    .select('id');
  
  // Get staff user IDs
  const staffUsers = await knex('users')
    .whereIn('email', ['accountant@simtechinstitute.edu', 'security@simtechinstitute.edu', 'admin.staff@simtechinstitute.edu'])
    .orderBy('email')
    .select('id');
  
  // Teachers
  await knex('teachers').insert([
    {
      school_id: schoolId,
      user_id: teacherUsers[0].id,
      employee_id: 'STF-2024-0001',
      qualification: 'B.Ed English',
      specialization: 'English Language',
      subjects: JSON.stringify(['English', 'Literature']),
      hire_date: '2020-09-01',
      salary: 1500,
      status: 'active'
    },
    {
      school_id: schoolId,
      user_id: teacherUsers[1].id,
      employee_id: 'STF-2024-0002',
      qualification: 'B.Sc Mathematics',
      specialization: 'Mathematics',
      subjects: JSON.stringify(['Mathematics', 'Physics']),
      hire_date: '2021-09-01',
      salary: 1600,
      status: 'active'
    },
    {
      school_id: schoolId,
      user_id: teacherUsers[2].id,
      employee_id: 'STF-2024-0003',
      qualification: 'B.Sc Biology',
      specialization: 'Science',
      subjects: JSON.stringify(['Biology', 'Chemistry']),
      hire_date: '2019-09-01',
      salary: 1550,
      status: 'active'
    },
    {
      school_id: schoolId,
      user_id: teacherUsers[3].id,
      employee_id: 'STF-2024-0004',
      qualification: 'B.A History',
      specialization: 'Social Studies',
      subjects: JSON.stringify(['Social Studies', 'History']),
      hire_date: '2022-09-01',
      salary: 1450,
      status: 'active'
    },
    {
      school_id: schoolId,
      user_id: teacherUsers[4].id,
      employee_id: 'STF-2024-0005',
      qualification: 'B.Sc Computer Science',
      specialization: 'ICT',
      subjects: JSON.stringify(['ICT', 'Computer Science']),
      hire_date: '2023-09-01',
      salary: 1700,
      status: 'active'
    }
  ]);
  
  // Staff
  await knex('staff').insert([
    {
      school_id: schoolId,
      user_id: staffUsers[0].id,
      employee_id: 'STF-2024-0006',
      department: 'Finance',
      position: 'Accountant',
      hire_date: '2018-09-01',
      salary: 1200,
      status: 'active'
    },
    {
      school_id: schoolId,
      user_id: staffUsers[1].id,
      employee_id: 'STF-2024-0007',
      department: 'Security',
      position: 'Security Officer',
      hire_date: '2019-09-01',
      salary: 800,
      status: 'active'
    },
    {
      school_id: schoolId,
      user_id: staffUsers[2].id,
      employee_id: 'STF-2024-0008',
      department: 'Administration',
      position: 'Administrative Assistant',
      hire_date: '2020-09-01',
      salary: 900,
      status: 'active'
    }
  ]);
  
  // Update divisions with principals
  const elementaryPrincipal = await knex('users').where('email', 'principal.elementary@simtechinstitute.edu').first('id');
  const seniorPrincipal = await knex('users').where('email', 'principal.senior@simtechinstitute.edu').first('id');
  const elementaryDivision = await knex('divisions').where('code', 'ELE001').first('id');
  const seniorDivision = await knex('divisions').where('code', 'SHS001').first('id');
  
  await knex('divisions')
    .where('id', elementaryDivision.id)
    .update({ principal_id: elementaryPrincipal.id });
    
  await knex('divisions')
    .where('id', seniorDivision.id)
    .update({ principal_id: seniorPrincipal.id });
};
