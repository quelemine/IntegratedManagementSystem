/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
  const kgDivisionId = process.env.SEED_DIVISION_KG001_ID || (await knex('divisions').where('code', 'KG001').first('id')).id;
  const eleDivisionId = process.env.SEED_DIVISION_ELE001_ID || (await knex('divisions').where('code', 'ELE001').first('id')).id;
  const jhsDivisionId = process.env.SEED_DIVISION_JHS001_ID || (await knex('divisions').where('code', 'JHS001').first('id')).id;
  const shsDivisionId = process.env.SEED_DIVISION_SHS001_ID || (await knex('divisions').where('code', 'SHS001').first('id')).id;
  
  // Get all existing grade codes
  const existingGrades = await knex('grades').select('code');
  const existingCodes = existingGrades.map(g => g.code);
  
  const gradesToInsert = [];
  
  // Kindergarten
  const kgGrades = [
    { division_id: kgDivisionId, name: 'ABC', code: 'KG-ABC', order: 1 },
    { division_id: kgDivisionId, name: 'Nursery', code: 'KG-NUR', order: 2 },
    { division_id: kgDivisionId, name: 'K1', code: 'KG-K1', order: 3 },
    { division_id: kgDivisionId, name: 'K2', code: 'KG-K2', order: 4 }
  ];
  kgGrades.forEach(grade => {
    if (!existingCodes.includes(grade.code)) {
      gradesToInsert.push(grade);
    }
  });
  
  // Elementary
  for (let i = 1; i <= 6; i++) {
    const code = `ELE-G${i}`;
    if (!existingCodes.includes(code)) {
      gradesToInsert.push({
        division_id: eleDivisionId,
        name: `Grade ${i}`,
        code: code,
        order: i
      });
    }
  }
  
  // Junior High
  for (let i = 7; i <= 9; i++) {
    const code = `JHS-G${i}`;
    if (!existingCodes.includes(code)) {
      gradesToInsert.push({
        division_id: jhsDivisionId,
        name: `Grade ${i}`,
        code: code,
        order: i - 6
      });
    }
  }
  
  // Senior High
  for (let i = 10; i <= 12; i++) {
    const code = `SHS-G${i}`;
    if (!existingCodes.includes(code)) {
      gradesToInsert.push({
        division_id: shsDivisionId,
        name: `Grade ${i}`,
        code: code,
        order: i - 9
      });
    }
  }
  
  // Insert only new grades
  if (gradesToInsert.length > 0) {
    await knex('grades').insert(gradesToInsert);
  }
  
  console.log(`Processed ${gradesToInsert.length} new grades`);
};
