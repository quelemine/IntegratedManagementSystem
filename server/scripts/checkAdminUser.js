require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const db = require('../config/database');

async function checkAdminUser() {
  try {
    console.log('Checking for admin user...\n');
    
    const users = await db('users')
      .select('id', 'email', 'first_name', 'last_name')
      .limit(10);
    
    console.log('Users in database:');
    users.forEach(user => {
      console.log(`- ${user.email} (${user.first_name} ${user.last_name})`);
    });
    
    // Check for specific admin email
    const adminUser = await db('users')
      .where('email', 'admin@simtechinstitute.edu')
      .first();
    
    if (adminUser) {
      console.log('\n✓ Admin user found:', adminUser.email);
    } else {
      console.log('\n✗ Admin user not found in database');
      console.log('You may need to create an admin user or update the test credentials');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkAdminUser();
