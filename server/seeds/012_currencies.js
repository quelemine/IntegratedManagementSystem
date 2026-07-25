/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
  const schoolId = process.env.SEED_SCHOOL_ID || (await knex('schools').first('id')).id;
  
  // Get existing currency codes
  const existingCurrencies = await knex('currencies').where('school_id', schoolId).select('code');
  const existingCodes = existingCurrencies.map(c => c.code);
  
  const currencies = [
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
  ];
  
  const currenciesToInsert = currencies.filter(currency => !existingCodes.includes(currency.code));
  
  // Insert only new currencies
  if (currenciesToInsert.length > 0) {
    await knex('currencies').insert(currenciesToInsert);
  }
  
  console.log(`Processed ${currenciesToInsert.length} new currencies`);
};
