/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
  const schoolId = process.env.SEED_SCHOOL_ID || (await knex('schools').first('id')).id;
  
  // Get existing class names
  const existingClasses = await knex('classes').where('school_id', schoolId).select('name');
  const existingClassNames = existingClasses.map(c => c.name);
  
  const classesToInsert = [];
  
  // Kindergarten classes
  const kgGrade = await knex('grades').where('code', 'KG-ABC').first('id');
  const kgClasses = [
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
  ];
  kgClasses.forEach(cls => {
    if (!existingClassNames.includes(cls.name)) {
      classesToInsert.push(cls);
    }
  });
  
  // Elementary classes
  for (let i = 1; i <= 3; i++) {
    const className = `Grade ${i}A`;
    if (!existingClassNames.includes(className)) {
      const grade = await knex('grades').where('code', `ELE-G${i}`).first('id');
      classesToInsert.push({
        school_id: schoolId,
        grade_id: grade.id,
        name: className,
        capacity: 30,
        academic_year: '2024-2025'
      });
    }
  }
  
  // Junior High classes
  for (let i = 7; i <= 8; i++) {
    const className = `Grade ${i}A`;
    if (!existingClassNames.includes(className)) {
      const grade = await knex('grades').where('code', `JHS-G${i}`).first('id');
      classesToInsert.push({
        school_id: schoolId,
        grade_id: grade.id,
        name: className,
        capacity: 35,
        academic_year: '2024-2025'
      });
    }
  }
  
  // Senior High classes
  const grade10 = await knex('grades').where('code', 'SHS-G10').first('id');
  const shsClasses = [
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
  ];
  shsClasses.forEach(cls => {
    if (!existingClassNames.includes(cls.name)) {
      classesToInsert.push(cls);
    }
  });
  
  // Insert only new classes
  if (classesToInsert.length > 0) {
    await knex('classes').insert(classesToInsert);
  }
  
  console.log(`Processed ${classesToInsert.length} new classes`);
};
