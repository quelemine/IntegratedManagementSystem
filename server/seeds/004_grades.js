/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
  await knex('grades').del();
  
  const kgDivisionId = process.env.SEED_DIVISION_KG001_ID || (await knex('divisions').where('code', 'KG001').first('id')).id;
  const eleDivisionId = process.env.SEED_DIVISION_ELE001_ID || (await knex('divisions').where('code', 'ELE001').first('id')).id;
  const jhsDivisionId = process.env.SEED_DIVISION_JHS001_ID || (await knex('divisions').where('code', 'JHS001').first('id')).id;
  const shsDivisionId = process.env.SEED_DIVISION_SHS001_ID || (await knex('divisions').where('code', 'SHS001').first('id')).id;
  
  // Kindergarten
  await knex('grades').insert([
    { division_id: kgDivisionId, name: 'ABC', code: 'KG-ABC', order: 1 },
    { division_id: kgDivisionId, name: 'Nursery', code: 'KG-NUR', order: 2 },
    { division_id: kgDivisionId, name: 'K1', code: 'KG-K1', order: 3 },
    { division_id: kgDivisionId, name: 'K2', code: 'KG-K2', order: 4 }
  ]);
  
  // Elementary
  for (let i = 1; i <= 6; i++) {
    await knex('grades').insert({
      division_id: eleDivisionId,
      name: `Grade ${i}`,
      code: `ELE-G${i}`,
      order: i
    });
  }
  
  // Junior High
  for (let i = 7; i <= 9; i++) {
    await knex('grades').insert({
      division_id: jhsDivisionId,
      name: `Grade ${i}`,
      code: `JHS-G${i}`,
      order: i - 6
    });
  }
  
  // Senior High
  for (let i = 10; i <= 12; i++) {
    await knex('grades').insert({
      division_id: shsDivisionId,
      name: `Grade ${i}`,
      code: `SHS-G${i}`,
      order: i - 9
    });
  }
};
