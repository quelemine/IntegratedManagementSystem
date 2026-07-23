require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const db = require('../config/database');

async function checkUsers() {
  try {
    console.log('Checking users in database...\n');
    
    const users = await db('users')
      .select(
        'users.id',
        'users.email',
        'users.first_name',
        'users.last_name',
        'users.is_active',
        'roles.name as role_name'
      )
      .join('roles', 'users.role_id', 'roles.id')
      .orderBy('roles.name');
    
    console.log('Users by role:');
    users.forEach(user => {
      console.log(`- ${user.role_name}: ${user.email} (${user.first_name} ${user.last_name}) - Active: ${user.is_active}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkUsers();
