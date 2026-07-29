/**
 * Script to test login against deployed Render API
 * Usage: node server/scripts/testRenderLogin.js
 */

const axios = require('axios');

const testRenderLogin = async () => {
  try {
    console.log('=== Testing Render Production API ===\n');
    
    const API_URL = 'https://integrated-management-system.onrender.com/api';
    
    // First test health endpoint
    console.log('Testing health endpoint...');
    try {
      const healthResponse = await axios.get('https://integrated-management-system.onrender.com/health', {
        timeout: 10000
      });
      console.log(`  ✅ Health check: ${healthResponse.status}`);
      console.log(`  Status: ${healthResponse.data.status}`);
      console.log(`  Database: ${healthResponse.data.database.status}\n`);
    } catch (error) {
      console.log(`  ❌ Health check failed`);
      console.log(`  Status: ${error.response?.status || 'Network Error'}`);
      console.log(`  Error: ${error.response?.data?.error || error.message}\n`);
    }
    
    const testAccounts = [
      { email: 'admin@simtechinstitute.edu', password: '1234', role: 'Super Admin' },
      { email: 'parent1@simtechinstitute.edu', password: '1234', role: 'Parent' },
      { email: 'teacher.john@simtechinstitute.edu', password: '1234', role: 'Teacher' },
      { email: 'student1@simtechinstitute.edu', password: '1234', role: 'Student' }
    ];
    
    for (const account of testAccounts) {
      console.log(`Testing ${account.role}: ${account.email}`);
      
      try {
        const response = await axios.post(`${API_URL}/auth/login`, {
          email: account.email,
          password: account.password
        }, {
          timeout: 10000
        });
        
        console.log(`  ✅ Login successful`);
        console.log(`  User: ${response.data.data.user.email}`);
        console.log(`  Role: ${response.data.data.user.role}`);
        console.log(`  Token: ${response.data.data.token.substring(0, 30)}...\n`);
      } catch (error) {
        console.log(`  ❌ Login failed`);
        console.log(`  Status: ${error.response?.status || 'Network Error'}`);
        console.log(`  Error: ${error.response?.data?.error || error.message}\n`);
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error testing Render login:', error);
    process.exit(1);
  }
};

testRenderLogin();
