/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
  await knex('currencies').del();
  
  const schoolId = process.env.SEED_SCHOOL_ID || (await knex('schools').first('id')).id;
  
  await knex('currencies').insert([
    {
      school_id: schoolId,
      code: 'LRD',
      name: 'Liberian Dollar',
      symbol: 'L$',
      exchange_rate_to_usd: 0.0052,
      is_default: true,
      is_active: true
    },
    {
      school_id: schoolId,
      code: 'USD',
      name: 'United States Dollar',
      symbol: '$',
      exchange_rate_to_usd: 1.0,
      is_default: false,
      is_active: true
    }
  ]);
};
