/**
 * Script to test all user roles
 * Usage: node server/scripts/testAllRoles.js
 */

const axios = require('axios');

const testAllRoles = async () => {
  try {
    console.log('=== Testing All User Roles ===\n');
    
    const API_URL = 'http://localhost:5000/api';
    
    const testAccounts = [
      { email: 'admin@simtechinstitute.edu', password: '1234', role: 'Super Admin' },
      { email: 'parent1@simtechinstitute.edu', password: '1234', role: 'Parent' },
      { email: 'teacher.john@simtechinstitute.edu', password: '1234', role: 'Teacher' },
      { email: 'student1@simtechinstitute.edu', password: '1234', role: 'Student' },
      { email: 'admin.staff@simtechinstitute.edu', password: '1234', role: 'Staff' },
      { email: 'principal.senior@simtechinstitute.edu', password: '1234', role: 'Principal' }
    ];
    
    for (const account of testAccounts) {
      console.log(`--- Testing ${account.role} ---`);
      console.log(`Email: ${account.email}`);
      
      try {
        // Test login
        const loginResponse = await axios.post(`${API_URL}/auth/login`, {
          email: account.email,
          password: account.password
        });
        
        const token = loginResponse.data.data.token;
        const user = loginResponse.data.data.user;
        
        console.log(`✅ Login successful`);
        console.log(`  Role: ${user.role}`);
        console.log(`  User ID: ${user.id}`);
        
        // Test dashboard access (role-specific endpoints)
        const dashboardEndpoints = {
          'super_admin': '/dashboard/admin',
          'parent': '/dashboard/parent',
          'teacher': '/dashboard/teacher',
          'student': '/dashboard/student',
          'staff': '/dashboard/admin',
          'principal': '/dashboard/admin'
        };
        
        const dashboardEndpoint = dashboardEndpoints[user.role] || '/dashboard/admin';
        
        try {
          const dashboardResponse = await axios.get(`${API_URL}${dashboardEndpoint}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          console.log(`✅ Dashboard accessible (${dashboardEndpoint})`);
        } catch (dashboardError) {
          console.log(`⚠️  Dashboard (${dashboardEndpoint}): ${dashboardError.response?.status || 'Network Error'}`);
        }
        
        // Test health endpoint
        try {
          const healthResponse = await axios.get('http://localhost:5000/health');
          console.log(`✅ Health check: ${healthResponse.data.status}`);
        } catch (healthError) {
          console.log(`⚠️  Health check failed`);
        }
        
      } catch (error) {
        console.log(`❌ Login failed`);
        console.log(`  Status: ${error.response?.status || 'Network Error'}`);
        console.log(`  Error: ${error.response?.data?.error || error.message}`);
      }
      
      console.log();
    }
    
    console.log('=== All Role Tests Complete ===');
    process.exit(0);
  } catch (error) {
    console.error('Error testing roles:', error);
    process.exit(1);
  }
};

testAllRoles();
