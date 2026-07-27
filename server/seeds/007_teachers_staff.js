/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
  const schoolId = process.env.SEED_SCHOOL_ID || (await knex('schools').first('id')).id;
  const teacherRoleId = process.env.SEED_ROLE_TEACHER_ID || (await knex('roles').where('name', 'teacher').first('id')).id;
  const staffRoleId = process.env.SEED_ROLE_STAFF_ID || (await knex('roles').where('name', 'staff').first('id')).id;
  
  // Get teacher user IDs by role and names (new email format: mbrown@simtechinstitute.edu)
  const teacherUsers = await knex('users')
    .join('roles', 'users.role_id', 'roles.id')
    .where('roles.name', 'teacher')
    .where('users.school_id', schoolId)
    .whereIn('users.first_name', ['Mary', 'John', 'Emily', 'Michael', 'Lisa'])
    .whereIn('users.last_name', ['Brown', 'Davis', 'Miller', 'Wilson', 'Taylor'])
    .orderBy('users.first_name')
    .select('users.id', 'users.first_name', 'users.last_name');
  
  // Get staff user IDs by role and names (new email format: randerson@simtechinstitute.edu)
  const staffUsers = await knex('users')
    .join('roles', 'users.role_id', 'roles.id')
    .where('roles.name', 'staff')
    .where('users.school_id', schoolId)
    .whereIn('users.first_name', ['Robert', 'David', 'Jennifer'])
    .whereIn('users.last_name', ['Anderson', 'Thomas', 'White'])
    .orderBy('users.first_name')
    .select('users.id', 'users.first_name', 'users.last_name');
  
  // Get existing teacher user IDs
  const existingTeachers = await knex('teachers').select('user_id');
  const existingTeacherUserIds = existingTeachers.map(t => t.user_id);
  
  // Teachers
  const teachersToInsert = [];
  const teacherData = [
    {
      user_id: teacherUsers.find(u => u.first_name === 'Mary' && u.last_name === 'Brown')?.id,
      employee_id: 'STF-2024-0001',
      qualification: 'B.Ed English',
      specialization: 'English Language',
      subjects: JSON.stringify(['English', 'Literature']),
      hire_date: '2020-09-01',
      salary: 1500,
      status: 'active'
    },
    {
      user_id: teacherUsers.find(u => u.first_name === 'John' && u.last_name === 'Davis')?.id,
      employee_id: 'STF-2024-0002',
      qualification: 'B.Sc Mathematics',
      specialization: 'Mathematics',
      subjects: JSON.stringify(['Mathematics', 'Physics']),
      hire_date: '2021-09-01',
      salary: 1600,
      status: 'active'
    },
    {
      user_id: teacherUsers.find(u => u.first_name === 'Emily' && u.last_name === 'Miller')?.id,
      employee_id: 'STF-2024-0003',
      qualification: 'B.Sc Biology',
      specialization: 'Science',
      subjects: JSON.stringify(['Biology', 'Chemistry']),
      hire_date: '2019-09-01',
      salary: 1550,
      status: 'active'
    },
    {
      user_id: teacherUsers.find(u => u.first_name === 'Michael' && u.last_name === 'Wilson')?.id,
      employee_id: 'STF-2024-0004',
      qualification: 'B.A History',
      specialization: 'Social Studies',
      subjects: JSON.stringify(['Social Studies', 'History']),
      hire_date: '2022-09-01',
      salary: 1450,
      status: 'active'
    },
    {
      user_id: teacherUsers.find(u => u.first_name === 'Lisa' && u.last_name === 'Taylor')?.id,
      employee_id: 'STF-2024-0005',
      qualification: 'B.Sc Computer Science',
      specialization: 'ICT',
      subjects: JSON.stringify(['ICT', 'Computer Science']),
      hire_date: '2023-09-01',
      salary: 1700,
      status: 'active'
    }
  ];
  
  teacherData.forEach(teacher => {
    if (teacher.user_id && !existingTeacherUserIds.includes(teacher.user_id)) {
      teachersToInsert.push({ ...teacher, school_id: schoolId });
    }
  });
  
  if (teachersToInsert.length > 0) {
    await knex('teachers').insert(teachersToInsert);
  }
  
  // Get existing staff user IDs
  const existingStaff = await knex('staff').select('user_id');
  const existingStaffUserIds = existingStaff.map(s => s.user_id);
  
  // Staff
  const staffToInsert = [];
  const staffData = [
    {
      user_id: staffUsers.find(u => u.first_name === 'Robert' && u.last_name === 'Anderson')?.id,
      employee_id: 'STF-2024-0006',
      department: 'Finance',
      position: 'Accountant',
      hire_date: '2018-09-01',
      salary: 1200,
      status: 'active'
    },
    {
      user_id: staffUsers.find(u => u.first_name === 'David' && u.last_name === 'Thomas')?.id,
      employee_id: 'STF-2024-0007',
      department: 'Security',
      position: 'Security Officer',
      hire_date: '2019-09-01',
      salary: 800,
      status: 'active'
    },
    {
      user_id: staffUsers.find(u => u.first_name === 'Jennifer' && u.last_name === 'White')?.id,
      employee_id: 'STF-2024-0008',
      department: 'Administration',
      position: 'Administrative Assistant',
      hire_date: '2020-09-01',
      salary: 900,
      status: 'active'
    }
  ];
  
  staffData.forEach(staff => {
    if (staff.user_id && !existingStaffUserIds.includes(staff.user_id)) {
      staffToInsert.push({ ...staff, school_id: schoolId });
    }
  });
  
  if (staffToInsert.length > 0) {
    await knex('staff').insert(staffToInsert);
  }
  
  // Update divisions with principals (new email format: sjohnson@simtechinstitute.edu)
  const elementaryPrincipal = await knex('users')
    .join('roles', 'users.role_id', 'roles.id')
    .where('roles.name', 'principal')
    .where('users.first_name', 'Sarah')
    .where('users.last_name', 'Johnson')
    .first('users.id');
  const seniorPrincipal = await knex('users')
    .join('roles', 'users.role_id', 'roles.id')
    .where('roles.name', 'principal')
    .where('users.first_name', 'James')
    .where('users.last_name', 'Williams')
    .first('users.id');
  const elementaryDivision = await knex('divisions').where('code', 'ELE001').first('id');
  const seniorDivision = await knex('divisions').where('code', 'SHS001').first('id');
  
  if (elementaryPrincipal && elementaryDivision) {
    await knex('divisions')
      .where('id', elementaryDivision.id)
      .update({ principal_id: elementaryPrincipal.id });
  }
    
  if (seniorPrincipal && seniorDivision) {
    await knex('divisions')
      .where('id', seniorDivision.id)
      .update({ principal_id: seniorPrincipal.id });
  }
  
  console.log(`Processed ${teachersToInsert.length} new teachers, ${staffToInsert.length} new staff`);
};
