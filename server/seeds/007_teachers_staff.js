/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
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
  
  // Get existing teacher user IDs
  const existingTeachers = await knex('teachers').select('user_id');
  const existingTeacherUserIds = existingTeachers.map(t => t.user_id);
  
  // Teachers
  const teachersToInsert = [];
  const teacherData = [
    {
      user_id: teacherUsers[0]?.id,
      employee_id: 'STF-2024-0001',
      qualification: 'B.Ed English',
      specialization: 'English Language',
      subjects: JSON.stringify(['English', 'Literature']),
      hire_date: '2020-09-01',
      salary: 1500,
      status: 'active'
    },
    {
      user_id: teacherUsers[1]?.id,
      employee_id: 'STF-2024-0002',
      qualification: 'B.Sc Mathematics',
      specialization: 'Mathematics',
      subjects: JSON.stringify(['Mathematics', 'Physics']),
      hire_date: '2021-09-01',
      salary: 1600,
      status: 'active'
    },
    {
      user_id: teacherUsers[2]?.id,
      employee_id: 'STF-2024-0003',
      qualification: 'B.Sc Biology',
      specialization: 'Science',
      subjects: JSON.stringify(['Biology', 'Chemistry']),
      hire_date: '2019-09-01',
      salary: 1550,
      status: 'active'
    },
    {
      user_id: teacherUsers[3]?.id,
      employee_id: 'STF-2024-0004',
      qualification: 'B.A History',
      specialization: 'Social Studies',
      subjects: JSON.stringify(['Social Studies', 'History']),
      hire_date: '2022-09-01',
      salary: 1450,
      status: 'active'
    },
    {
      user_id: teacherUsers[4]?.id,
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
      user_id: staffUsers[0]?.id,
      employee_id: 'STF-2024-0006',
      department: 'Finance',
      position: 'Accountant',
      hire_date: '2018-09-01',
      salary: 1200,
      status: 'active'
    },
    {
      user_id: staffUsers[1]?.id,
      employee_id: 'STF-2024-0007',
      department: 'Security',
      position: 'Security Officer',
      hire_date: '2019-09-01',
      salary: 800,
      status: 'active'
    },
    {
      user_id: staffUsers[2]?.id,
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
  
  // Update divisions with principals
  const elementaryPrincipal = await knex('users').where('email', 'principal.elementary@simtechinstitute.edu').first('id');
  const seniorPrincipal = await knex('users').where('email', 'principal.senior@simtechinstitute.edu').first('id');
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
