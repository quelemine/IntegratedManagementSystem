/**
 * Script to test parent grades API
 * Usage: node server/scripts/testParentGrades.js
 */

const axios = require('axios');

const testParentGrades = async () => {
  try {
    console.log('=== Testing Parent Grades API ===\n');
    
    const API_URL = 'http://localhost:5000/api';
    
    // First login as parent
    console.log('Logging in as parent1@simtechinstitute.edu...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'parent1@simtechinstitute.edu',
      password: '1234'
    });
    
    const token = loginResponse.data.data.token;
    const user = loginResponse.data.data.user;
    
    console.log(`✅ Login successful`);
    console.log(`  User: ${user.email}`);
    console.log(`  Role: ${user.role}`);
    console.log(`  Token: ${token.substring(0, 30)}...\n`);
    
    // Get parent's children
    console.log('Getting parent dashboard data...');
    const dashboardResponse = await axios.get(`${API_URL}/parents/my-children`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const children = dashboardResponse.data.data || [];
    console.log(`✅ Found ${children.length} children\n`);
    
    if (children.length === 0) {
      console.log('No children found. Exiting.');
      process.exit(0);
    }
    
    // Test grades for first child
    const firstChild = children[0];
    console.log(`Testing grades for child: ${firstChild.first_name} ${firstChild.last_name} (ID: ${firstChild.id})\n`);
    
    const gradesResponse = await axios.get(`${API_URL}/student-grades?student_id=${firstChild.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const grades = gradesResponse.data.data || [];
    console.log(`✅ Grades API response successful`);
    console.log(`  Total grades: ${grades.length}\n`);
    
    if (grades.length > 0) {
      console.log('Sample grades:');
      grades.slice(0, 5).forEach((grade, idx) => {
        console.log(`  ${idx + 1}. ${grade.course_name || 'N/A'} - ${grade.score || 0}% (${grade.grade_type})`);
      });
    }
    
    console.log('\n=== Parent Grades API Test Complete ===');
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:');
    console.error(`  Status: ${error.response?.status || 'Network Error'}`);
    console.error(`  Error: ${error.response?.data?.error || error.message}`);
    process.exit(1);
  }
};

testParentGrades();
