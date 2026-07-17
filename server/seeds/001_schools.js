const bcrypt = require('bcryptjs');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
  await knex('schools').del();
  
  const schoolId = (await knex('schools').insert({
    name: 'SIM Technology Institute',
    code: 'SIM001',
    address: 'Brooklyn Community, Lofa Road, Gbarnga City, Bong County - Liberia',
    phone: '+231880857969',
    email: 'quelemineisaacl@gmail.com',
    primary_color: '#ADD8E6',
    secondary_color: '#800080',
    accent_color: '#FFFFFF',
    logo_url: '/uploads/school-logo.png',
    settings: JSON.stringify({
      academic_year: '2024-2025',
      currency: 'LRD',
      timezone: 'Africa/Monrovia'
    })
  }).returning('id'))[0].id;
  
  // Store the school ID for use in other seeds
  process.env.SEED_SCHOOL_ID = schoolId;
};
