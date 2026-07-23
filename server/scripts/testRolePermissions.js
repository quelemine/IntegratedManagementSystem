require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

// Test credentials for different roles (using actual users from database)
const testUsers = [
  { email: 'admin@simtechinstitute.edu', password: 'ChangeMe123!', role: 'admin' },
  { email: 'principal.senior@simtechinstitute.edu', password: 'Password123!', role: 'principal' },
  { email: 'teacher.mary@simtechinstitute.edu', password: 'Password123!', role: 'teacher' },
  { email: 'student1@simtechinstitute.edu', password: 'Password123!', role: 'student' },
  { email: 'parent1@simtechinstitute.edu', password: 'Password123!', role: 'parent' }
];

async function login(email, password) {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, { email, password });
    return response.data.data.token;
  } catch (error) {
    console.error(`Login failed for ${email}:`, error.response?.data?.error || error.message);
    return null;
  }
}

async function testGetEndpoint(token, endpoint, description) {
  try {
    const response = await axios.get(`${API_URL}${endpoint}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✓ ${description}: ${response.data.data.length} records`);
    return true;
  } catch (error) {
    console.log(`✗ ${description}: ${error.response?.status} - ${error.response?.data?.error || error.message}`);
    return false;
  }
}

async function testPostEndpoint(token, endpoint, data, description) {
  try {
    const response = await axios.post(`${API_URL}${endpoint}`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✓ ${description}: Created`);
    return { success: true, id: response.data.data.id };
  } catch (error) {
    console.log(`✗ ${description}: ${error.response?.status} - ${error.response?.data?.error || error.message}`);
    return { success: false };
  }
}

async function testPutEndpoint(token, endpoint, data, description) {
  try {
    await axios.put(`${API_URL}${endpoint}`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✓ ${description}: Updated`);
    return true;
  } catch (error) {
    console.log(`✗ ${description}: ${error.response?.status} - ${error.response?.data?.error || error.message}`);
    return false;
  }
}

async function testDeleteEndpoint(token, endpoint, description) {
  try {
    await axios.delete(`${API_URL}${endpoint}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✓ ${description}: Deleted`);
    return true;
  } catch (error) {
    console.log(`✗ ${description}: ${error.response?.status} - ${error.response?.data?.error || error.message}`);
    return false;
  }
}

async function testRolePermissions() {
  console.log('=== Testing Role-Based Permissions ===\n');

  for (const user of testUsers) {
    console.log(`\n--- Testing ${user.role.toUpperCase()} (${user.email}) ---`);
    
    const token = await login(user.email, user.password);
    if (!token) {
      console.log(`⚠ Skipping ${user.role} - login failed`);
      continue;
    }

    // Test GET endpoints (all roles should be able to view)
    console.log('\nGET Endpoints (View):');
    await testGetEndpoint(token, '/attendance', 'Attendance');
    await testGetEndpoint(token, '/assignments', 'Assignments');
    await testGetEndpoint(token, '/quizzes', 'Quizzes');
    await testGetEndpoint(token, '/student-grades', 'Student Grades');

    // Test POST endpoints (create)
    console.log('\nPOST Endpoints (Create):');
    
    if (user.role === 'admin' || user.role === 'teacher') {
      // Get data for creating records
      const teachersRes = await axios.get(`${API_URL}/teachers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const assignmentsRes = await axios.get(`${API_URL}/assignments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (teachersRes.data.data.length > 0 && assignmentsRes.data.data.length > 0) {
        const teacherId = teachersRes.data.data[0].id;
        const courseId = assignmentsRes.data.data[0].course_id;
        
        // Test Attendance creation
        const attendanceRes = await axios.get(`${API_URL}/attendance`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (attendanceRes.data.data.length > 0) {
          const studentId = attendanceRes.data.data[0].student_id;
          const classId = attendanceRes.data.data[0].class_id;
          const uniqueDate = new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0];
          
          const attendanceResult = await testPostEndpoint(
            token,
            '/attendance',
            { student_id: studentId, class_id: classId, date: uniqueDate, status: 'present' },
            'Attendance'
          );
          
          if (attendanceResult.success) {
            await testPutEndpoint(token, `/attendance/${attendanceResult.id}`, { status: 'late' }, 'Attendance');
            await testDeleteEndpoint(token, `/attendance/${attendanceResult.id}`, 'Attendance');
          }
        }
        
        // Test Assignment creation
        const assignmentResult = await testPostEndpoint(
          token,
          '/assignments',
          { course_id: courseId, teacher_id: teacherId, title: 'Test Assignment', total_points: 100 },
          'Assignment'
        );
        
        if (assignmentResult.success) {
          await testPutEndpoint(token, `/assignments/${assignmentResult.id}`, { title: 'Updated' }, 'Assignment');
          await testDeleteEndpoint(token, `/assignments/${assignmentResult.id}`, 'Assignment');
        }
        
        // Test Quiz creation
        const quizResult = await testPostEndpoint(
          token,
          '/quizzes',
          { course_id: courseId, teacher_id: teacherId, title: 'Test Quiz', total_points: 100 },
          'Quiz'
        );
        
        if (quizResult.success) {
          await testPutEndpoint(token, `/quizzes/${quizResult.id}`, { title: 'Updated' }, 'Quiz');
          await testDeleteEndpoint(token, `/quizzes/${quizResult.id}`, 'Quiz');
        }
        
        // Test Student Grade creation
        const gradesRes = await axios.get(`${API_URL}/student-grades`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (gradesRes.data.data.length > 0) {
          const studentId = gradesRes.data.data[0].student_id;
          const gradeResult = await testPostEndpoint(
            token,
            '/student-grades',
            { student_id: studentId, course_id: courseId, grade_type: 'assignment', score: 85, total_points: 100, letter_grade: 'B' },
            'Student Grade'
          );
          
          if (gradeResult.success) {
            await testPutEndpoint(token, `/student-grades/${gradeResult.id}`, { score: 90 }, 'Student Grade');
            await testDeleteEndpoint(token, `/student-grades/${gradeResult.id}`, 'Student Grade');
          }
        }
      }
    } else {
      // Students and Parents should not be able to create
      console.log('⚠ Skipping POST tests (not admin or teacher)');
    }
  }

  console.log('\n=== Role-Based Permission Testing Complete ===');
}

testRolePermissions();
