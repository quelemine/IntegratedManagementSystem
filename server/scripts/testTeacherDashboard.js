/**
 * Script to test teacher dashboard
 * Usage: node server/scripts/testTeacherDashboard.js
 */

const axios = require('axios');

const testTeacherDashboard = async () => {
  try {
    console.log('=== Testing Teacher Dashboard ===\n');
    
    const API_URL = 'http://localhost:5000/api';
    
    // Login as teacher
    console.log('Logging in as teacher...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'teacher.john@simtechinstitute.edu',
      password: '1234'
    });
    
    const token = loginResponse.data.data.token;
    const user = loginResponse.data.data.user;
    
    console.log('✅ Login successful');
    console.log('  User:', user.email);
    console.log('  Role:', user.role);
    console.log('  User ID:', user.id);
    console.log('  School ID:', user.school_id);
    console.log('  Full user object:', JSON.stringify(user, null, 2));
    
    // Test teacher dashboard
    console.log('\nTesting teacher dashboard...');
    try {
      const dashboardResponse = await axios.get(`${API_URL}/dashboard/teacher`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Dashboard successful');
      console.log('  Data:', JSON.stringify(dashboardResponse.data, null, 2));
    } catch (error) {
      console.log('❌ Dashboard failed');
      console.log('  Status:', error.response?.status);
      console.log('  Error:', error.response?.data);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

testTeacherDashboard();
