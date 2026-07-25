const bcrypt = require('bcryptjs');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
  const hashedPassword = await bcrypt.hash('ChangeMe123!', 10);
  
  const schoolId = process.env.SEED_SCHOOL_ID || (await knex('schools').first('id')).id;
  const superAdminRoleId = process.env.SEED_ROLE_SUPER_ADMIN_ID || (await knex('roles').where('name', 'super_admin').first('id')).id;
  
  // Check if admin user already exists
  const existingAdmin = await knex('users').where('email', 'admin@simtechinstitute.edu').first();
  
  if (existingAdmin) {
    // Update the password to ensure it matches
    await knex('users')
      .where('email', 'admin@simtechinstitute.edu')
      .update({
        password: hashedPassword,
        is_active: true
      });
    console.log('Admin user password updated successfully');
    return;
  }
  
  await knex('users').insert([
    {
      school_id: schoolId,
      email: 'admin@simtechinstitute.edu',
      password: hashedPassword,
      role_id: superAdminRoleId,
      first_name: 'System',
      last_name: 'Administrator',
      phone: '+231880857969',
      is_active: true
    }
  ]);
  
  console.log('Admin user created successfully');
};
