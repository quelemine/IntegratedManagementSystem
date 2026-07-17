/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
  await knex('divisions').del();
  
  const schoolId = process.env.SEED_SCHOOL_ID || (await knex('schools').first('id')).id;
  
  const divisions = await knex('divisions').insert([
    {
      school_id: schoolId,
      name: 'Kindergarten',
      code: 'KG001',
      level: 'kindergarten'
    },
    {
      school_id: schoolId,
      name: 'Elementary School',
      code: 'ELE001',
      level: 'elementary'
    },
    {
      school_id: schoolId,
      name: 'Junior High School',
      code: 'JHS001',
      level: 'junior_high'
    },
    {
      school_id: schoolId,
      name: 'Senior High School',
      code: 'SHS001',
      level: 'senior_high'
    }
  ]).returning('id');
  
  // Store division IDs for use in other seeds
  const divisionNames = ['Kindergarten', 'Elementary School', 'Junior High School', 'Senior High School'];
  const divisionCodes = ['KG001', 'ELE001', 'JHS001', 'SHS001'];
  divisions.forEach((division, index) => {
    process.env[`SEED_DIVISION_${divisionCodes[index]}_ID`] = division.id;
  });
};
