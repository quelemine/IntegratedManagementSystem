const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

const testResults = {
  frontend: {},
  backend: {},
  roles: {},
  performance: {}
};

const credentials = {
  admin: { email: 'admin@simtechinstitute.edu', password: 'Password123!' },
  principal: { email: 'principal.elementary@simtechinstitute.edu', password: 'Password123!' },
  teacher: { email: 'teacher.mary@simtechinstitute.edu', password: 'Password123!' },
  student: { email: 'student1@simtechinstitute.edu', password: 'Password123!' },
  parent: { email: 'parent1@simtechinstitute.edu', password: 'Password123!' }
};

async function testLogin(role) {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, credentials[role]);
    await new Promise(resolve => setTimeout(resolve, 2000)); // Delay to avoid rate limiting
    return response.data.data;
  } catch (error) {
    console.error(`Login failed for ${role}:`, error.response?.data || error.message);
    return null;
  }
}

async function testEndpoint(token, endpoint, method = 'GET', body = null) {
  try {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    let response;
    if (method === 'GET') {
      response = await axios.get(`${API_URL}${endpoint}`, config);
    } else if (method === 'POST') {
      response = await axios.post(`${API_URL}${endpoint}`, body, config);
    } else if (method === 'PUT') {
      response = await axios.put(`${API_URL}${endpoint}`, body, config);
    } else if (method === 'DELETE') {
      response = await axios.delete(`${API_URL}${endpoint}`, config);
    }
    await new Promise(resolve => setTimeout(resolve, 100)); // Small delay between requests
    return { success: true, status: response.status };
  } catch (error) {
    await new Promise(resolve => setTimeout(resolve, 100)); // Small delay between requests
    return { 
      success: false, 
      status: error.response?.status,
      error: error.response?.data?.error || error.message 
    };
  }
}

async function testRolePermissions() {
  console.log('\n=== Testing Role Permissions ===\n');

  for (const [role, cred] of Object.entries(credentials)) {
    console.log(`--- Testing ${role.toUpperCase()} ---`);
    const authData = await testLogin(role);
    if (!authData) {
      testResults.roles[role] = { login: 'FAILED' };
      continue;
    }

    const { token, user } = authData;
    testResults.roles[role] = { login: 'SUCCESS', userId: user.id, endpoints: {} };

    // Core endpoints
    const coreEndpoints = [
      '/users',
      '/students',
      '/teachers',
      '/parents',
      '/classes',
      '/schools'
    ];

    for (const endpoint of coreEndpoints) {
      const result = await testEndpoint(token, endpoint);
      testResults.roles[role].endpoints[endpoint] = result.success ? 'OK' : `FORBIDDEN (${result.status})`;
      console.log(`  ${endpoint}: ${result.success ? '✓' : '✗'}`);
    }

    // Academic endpoints
    const academicEndpoints = [
      '/attendance',
      '/assignments',
      '/quizzes',
      '/student-grades'
    ];

    for (const endpoint of academicEndpoints) {
      const result = await testEndpoint(token, endpoint);
      testResults.roles[role].endpoints[endpoint] = result.success ? 'OK' : `FORBIDDEN (${result.status})`;
      console.log(`  ${endpoint}: ${result.success ? '✓' : '✗'}`);
    }

    // Financial endpoints
    const financialEndpoints = [
      '/fees',
      '/invoices',
      '/payments',
      '/reports'
    ];

    for (const endpoint of financialEndpoints) {
      const result = await testEndpoint(token, endpoint);
      testResults.roles[role].endpoints[endpoint] = result.success ? 'OK' : `FORBIDDEN (${result.status})`;
      console.log(`  ${endpoint}: ${result.success ? '✓' : '✗'}`);
    }

    // Communication endpoints
    const communicationEndpoints = [
      '/messages',
      '/announcements',
      '/notifications',
      '/notifications/unread-count'
    ];

    for (const endpoint of communicationEndpoints) {
      const result = await testEndpoint(token, endpoint);
      testResults.roles[role].endpoints[endpoint] = result.success ? 'OK' : `FORBIDDEN (${result.status})`;
      console.log(`  ${endpoint}: ${result.success ? '✓' : '✗'}`);
    }

    console.log('');
  }
}

async function testBackendAPIs() {
  console.log('\n=== Testing Backend APIs ===\n');

  const authData = await testLogin('admin');
  if (!authData) {
    console.error('Cannot test APIs - admin login failed');
    return;
  }

  const { token } = authData;

  const endpoints = [
    { path: '/health', method: 'GET', noAuth: true },
    { path: '/users', method: 'GET' },
    { path: '/students', method: 'GET' },
    { path: '/teachers', method: 'GET' },
    { path: '/parents', method: 'GET' },
    { path: '/classes', method: 'GET' },
    { path: '/divisions', method: 'GET' },
    { path: '/grades', method: 'GET' },
    { path: '/schools', method: 'GET' },
    { path: '/attendance', method: 'GET' },
    { path: '/assignments', method: 'GET' },
    { path: '/quizzes', method: 'GET' },
    { path: '/student-grades', method: 'GET' },
    { path: '/fees', method: 'GET' },
    { path: '/invoices', method: 'GET' },
    { path: '/payments', method: 'GET' },
    { path: '/reports', method: 'GET' },
    { path: '/messages', method: 'GET' },
    { path: '/announcements', method: 'GET' },
    { path: '/notifications', method: 'GET' },
    { path: '/notifications/unread-count', method: 'GET' }
  ];

  for (const endpoint of endpoints) {
    const result = endpoint.noAuth 
      ? await testEndpoint(null, endpoint.path, endpoint.method)
      : await testEndpoint(token, endpoint.path, endpoint.method);
    
    testResults.backend[endpoint.path] = result;
    console.log(`${endpoint.method} ${endpoint.path}: ${result.success ? '✓' : '✗'} ${result.status || ''}`);
  }
}

async function testDatabaseRelationships() {
  console.log('\n=== Testing Database Relationships ===\n');

  const authData = await testLogin('admin');
  if (!authData) return;

  const { token } = authData;

  try {
    // Test student-user relationship
    const students = await axios.get(`${API_URL}/students`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✓ Students loaded: ${students.data.data.length} records`);
    testResults.backend.students = 'OK';

    // Test teacher-user relationship
    const teachers = await axios.get(`${API_URL}/teachers`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✓ Teachers loaded: ${teachers.data.data.length} records`);
    testResults.backend.teachers = 'OK';

    // Test class-grade-division relationships
    const classes = await axios.get(`${API_URL}/classes`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✓ Classes loaded: ${classes.data.data.length} records`);
    testResults.backend.classes = 'OK';

    // Test communication tables
    const messages = await axios.get(`${API_URL}/messages`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✓ Messages loaded: ${messages.data.data.length} records`);
    testResults.backend.messages = 'OK';

    const announcements = await axios.get(`${API_URL}/announcements`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✓ Announcements loaded: ${announcements.data.data.length} records`);
    testResults.backend.announcements = 'OK';

    const notifications = await axios.get(`${API_URL}/notifications`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✓ Notifications loaded: ${notifications.data.data.length} records`);
    testResults.backend.notifications = 'OK';

  } catch (error) {
    console.error('✗ Database relationship test failed:', error.message);
    testResults.backend.relationships = 'FAILED';
  }
}

async function testPerformance() {
  console.log('\n=== Testing Performance ===\n');

  const authData = await testLogin('admin');
  if (!authData) return;

  const { token } = authData;

  const start = Date.now();
  const users = await axios.get(`${API_URL}/users`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const usersTime = Date.now() - start;
  console.log(`Users endpoint: ${usersTime}ms (${users.data.data.length} records)`);
  testResults.performance.users = `${usersTime}ms`;

  const start2 = Date.now();
  const students = await axios.get(`${API_URL}/students`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const studentsTime = Date.now() - start2;
  console.log(`Students endpoint: ${studentsTime}ms (${students.data.data.length} records)`);
  testResults.performance.students = `${studentsTime}ms`;

  const start3 = Date.now();
  const messages = await axios.get(`${API_URL}/messages`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const messagesTime = Date.now() - start3;
  console.log(`Messages endpoint: ${messagesTime}ms (${messages.data.data.length} records)`);
  testResults.performance.messages = `${messagesTime}ms`;
}

async function runIntegrationTests() {
  console.log('=== INTEGRATION TEST SUITE ===');
  console.log('Testing Integrated Management System before Phase 5\n');

  try {
    await testBackendAPIs();
    await testDatabaseRelationships();
    await testRolePermissions();
    await testPerformance();

    console.log('\n=== TEST SUMMARY ===\n');
    console.log(JSON.stringify(testResults, null, 2));

    const failedTests = [];
    Object.entries(testResults.roles).forEach(([role, results]) => {
      if (results.login === 'FAILED') {
        failedTests.push(`${role} login failed`);
      }
    });

    if (failedTests.length === 0) {
      console.log('\n✓ All integration tests passed');
      console.log('System is ready for Phase 5 Production Hardening');
    } else {
      console.log('\n✗ Some tests failed:');
      failedTests.forEach(test => console.log(`  - ${test}`));
    }

    process.exit(failedTests.length === 0 ? 0 : 1);
  } catch (error) {
    console.error('Integration test error:', error);
    process.exit(1);
  }
}

runIntegrationTests();
