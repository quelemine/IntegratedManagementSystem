require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const db = require('../config/database');

async function checkAdminDetails() {
  try {
    console.log('Checking admin user details...\n');
    
    const adminUser = await db('users')
      .where('email', 'admin@simtechinstitute.edu')
      .first();
    
    if (adminUser) {
      console.log('Admin user found:');
      console.log('- ID:', adminUser.id);
      console.log('- Email:', adminUser.email);
      console.log('- Role ID:', adminUser.role_id);
      console.log('- School ID:', adminUser.school_id);
      console.log('- Is Active:', adminUser.is_active);
      
      // Check if role exists
      if (adminUser.role_id) {
        const role = await db('roles').where('id', adminUser.role_id).first();
        if (role) {
          console.log('\n✓ Role found:', role.name);
        } else {
          console.log('\n✗ Role not found in roles table for ID:', adminUser.role_id);
        }
      } else {
        console.log('\n✗ Admin user has no role_id');
      }
      
      // Check roles table
      const roles = await db('roles').select('*');
      console.log('\nAvailable roles:');
      roles.forEach(r => {
        console.log(`- ${r.name} (ID: ${r.id})`);
      });
    } else {
      console.log('✗ Admin user not found');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkAdminDetails();
