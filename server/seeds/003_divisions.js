/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
  const schoolId = process.env.SEED_SCHOOL_ID || (await knex('schools').first('id')).id;
  const divisionCodes = ['KG001', 'ELE001', 'JHS001', 'SHS001'];
  
  // Check which divisions already exist
  const existingDivisions = await knex('divisions').where('school_id', schoolId).whereIn('code', divisionCodes).select('code', 'id');
  const existingCodes = existingDivisions.map(d => d.code);
  
  const divisionsToInsert = [
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
  ].filter(division => !existingCodes.includes(division.code));
  
  // Insert only new divisions
  if (divisionsToInsert.length > 0) {
    await knex('divisions').insert(divisionsToInsert);
  }
  
  // Get all divisions (existing + newly inserted)
  const allDivisions = await knex('divisions').where('school_id', schoolId).whereIn('code', divisionCodes).select('id', 'code');
  
  // Store division IDs for use in other seeds
  allDivisions.forEach((division) => {
    process.env[`SEED_DIVISION_${division.code}_ID`] = division.id;
  });
  
  console.log(`Processed ${allDivisions.length} divisions (${divisionsToInsert.length} new)`);
};
