/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
  await knex('classes').del();
  
  const schoolId = process.env.SEED_SCHOOL_ID || (await knex('schools').first('id')).id;
  
  // Kindergarten classes
  const kgGrade = await knex('grades').where('code', 'KG-ABC').first('id');
  await knex('classes').insert([
    {
      school_id: schoolId,
      grade_id: kgGrade.id,
      name: 'Class A',
      capacity: 25,
      academic_year: '2024-2025'
    },
    {
      school_id: schoolId,
      grade_id: kgGrade.id,
      name: 'Class B',
      capacity: 25,
      academic_year: '2024-2025'
    }
  ]);
  
  // Elementary classes
  for (let i = 1; i <= 3; i++) {
    const grade = await knex('grades').where('code', `ELE-G${i}`).first('id');
    await knex('classes').insert({
      school_id: schoolId,
      grade_id: grade.id,
      name: `Grade ${i}A`,
      capacity: 30,
      academic_year: '2024-2025'
    });
  }
  
  // Junior High classes
  for (let i = 7; i <= 8; i++) {
    const grade = await knex('grades').where('code', `JHS-G${i}`).first('id');
    await knex('classes').insert({
      school_id: schoolId,
      grade_id: grade.id,
      name: `Grade ${i}A`,
      capacity: 35,
      academic_year: '2024-2025'
    });
  }
  
  // Senior High classes
  const grade10 = await knex('grades').where('code', 'SHS-G10').first('id');
  await knex('classes').insert([
    {
      school_id: schoolId,
      grade_id: grade10.id,
      name: 'Grade 10A (Science)',
      capacity: 30,
      academic_year: '2024-2025'
    },
    {
      school_id: schoolId,
      grade_id: grade10.id,
      name: 'Grade 10B (Arts)',
      capacity: 30,
      academic_year: '2024-2025'
    }
  ]);
};
