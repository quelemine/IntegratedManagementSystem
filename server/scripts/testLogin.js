/**
 * Script to test login API
 * Usage: node server/scripts/testLogin.js
 */

const axios = require('axios');

const testLogin = async () => {
  try {
    console.log('Testing login API...\n');
    
    const API_URL = 'http://localhost:5000/api';
    
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
        });
        
        console.log(`  ✅ Login successful`);
        console.log(`  User: ${response.data.data.user.email}`);
        console.log(`  Role: ${response.data.data.user.role}`);
        console.log(`  Token: ${response.data.data.token.substring(0, 30)}...\n`);
      } catch (error) {
        console.log(`  ❌ Login failed`);
        console.log(`  Error: ${error.response?.data?.error || error.message}\n`);
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error testing login:', error);
    process.exit(1);
  }
};

testLogin();
