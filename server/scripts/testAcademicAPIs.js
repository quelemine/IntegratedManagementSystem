require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function login() {
  try {
    console.log('Attempting login with admin@simtechinstitute.edu...');
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@simtechinstitute.edu',
      password: 'ChangeMe123!'
    });
    console.log('✓ Login successful');
    return response.data.data.token;
  } catch (error) {
    console.error('✗ Login failed');
    if (error.response) {
      console.error('  Status:', error.response.status);
      console.error('  Response:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('  No response received from server');
      console.error('  Make sure the backend server is running on port 5000');
    } else {
      console.error('  Error:', error.message);
    }
    throw error;
  }
}

async function testAttendanceAPIs(token) {
  console.log('\n=== Testing Attendance APIs ===');
  
  try {
    // Get attendance
    const getResponse = await axios.get(`${API_URL}/attendance`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✓ GET /attendance: ${getResponse.data.data.length} records`);
    
    if (getResponse.data.data.length > 0) {
      const firstRecord = getResponse.data.data[0];
      
      // Use valid IDs from existing record with a new date to avoid conflicts
      const studentId = firstRecord.student_id;
      const classId = firstRecord.class_id;
      
      if (studentId && classId) {
        // Create attendance with a unique date (2 days in future)
        const uniqueDate = new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0];
        const createResponse = await axios.post(`${API_URL}/attendance`, {
          student_id: studentId,
          class_id: classId,
          date: uniqueDate,
          status: 'present',
          remarks: 'Test attendance'
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`✓ POST /attendance: Created record with ID ${createResponse.data.data.id}`);
        
        // Update attendance
        const updateResponse = await axios.put(`${API_URL}/attendance/${createResponse.data.data.id}`, {
          status: 'late',
          remarks: 'Updated test attendance'
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`✓ PUT /attendance/${createResponse.data.data.id}: Updated to ${updateResponse.data.data.status}`);
        
        // Delete attendance
        await axios.delete(`${API_URL}/attendance/${createResponse.data.data.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`✓ DELETE /attendance/${createResponse.data.data.id}: Deleted`);
      } else {
        console.log('⚠ Skipping attendance POST/PUT/DELETE tests (missing student_id or class_id)');
      }
    }
  } catch (error) {
    console.error('✗ Attendance API error:', error.response?.data?.error || error.message);
    if (error.response) {
      console.error('  Status:', error.response.status);
      console.error('  Response:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

async function testAssignmentAPIs(token) {
  console.log('\n=== Testing Assignment APIs ===');
  
  try {
    // Get assignments
    const getResponse = await axios.get(`${API_URL}/assignments`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✓ GET /assignments: ${getResponse.data.data.length} records`);
    
    if (getResponse.data.data.length > 0) {
      const firstRecord = getResponse.data.data[0];
      
      // Use course_id from existing assignment record
      const courseId = firstRecord.course_id;
      
      // Get teachers for valid teacher_id
      const teachersRes = await axios.get(`${API_URL}/teachers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (courseId && teachersRes.data.data.length > 0) {
        // Use teachers table ID (id field) not user ID
        const teacherId = teachersRes.data.data[0].id;
        
        if (teacherId) {
          // Create assignment
          const createResponse = await axios.post(`${API_URL}/assignments`, {
            course_id: courseId,
            teacher_id: teacherId,
            title: 'Test Assignment',
            description: 'Test assignment description',
            due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            total_points: 100
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
          console.log(`✓ POST /assignments: Created "${createResponse.data.data.title}"`);
          
          // Update assignment
          const updateResponse = await axios.put(`${API_URL}/assignments/${createResponse.data.data.id}`, {
            title: 'Updated Test Assignment',
            total_points: 150
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
          console.log(`✓ PUT /assignments/${createResponse.data.data.id}: Updated to "${updateResponse.data.data.title}"`);
          
          // Delete assignment
          await axios.delete(`${API_URL}/assignments/${createResponse.data.data.id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          console.log(`✓ DELETE /assignments/${createResponse.data.data.id}: Deleted`);
        } else {
          console.log('⚠ Skipping assignment POST/PUT/DELETE tests (no teacher_record_id available)');
        }
      } else {
        console.log('⚠ Skipping assignment POST/PUT/DELETE tests (no course_id or teachers available)');
      }
    }
  } catch (error) {
    console.error('✗ Assignment API error:', error.response?.data?.error || error.message);
    if (error.response) {
      console.error('  Status:', error.response.status);
      console.error('  Response:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

async function testQuizAPIs(token) {
  console.log('\n=== Testing Quiz APIs ===');
  
  try {
    // Get quizzes
    const getResponse = await axios.get(`${API_URL}/quizzes`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✓ GET /quizzes: ${getResponse.data.data.length} records`);
    
    if (getResponse.data.data.length > 0) {
      const firstRecord = getResponse.data.data[0];
      
      // Use course_id from existing quiz record
      const courseId = firstRecord.course_id;
      
      // Get teachers for valid teacher_id
      const teachersRes = await axios.get(`${API_URL}/teachers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (courseId && teachersRes.data.data.length > 0) {
        // Use teachers table ID (id field) not user ID
        const teacherId = teachersRes.data.data[0].id;
        
        if (teacherId) {
          // Create quiz
          const createResponse = await axios.post(`${API_URL}/quizzes`, {
            course_id: courseId,
            teacher_id: teacherId,
            title: 'Test Quiz',
            description: 'Test quiz description',
            duration: 30,
            total_questions: 10,
            total_points: 100,
            shuffle_questions: false,
            show_results_immediately: true
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
          console.log(`✓ POST /quizzes: Created "${createResponse.data.data.title}"`);
          
          // Update quiz
          const updateResponse = await axios.put(`${API_URL}/quizzes/${createResponse.data.data.id}`, {
            title: 'Updated Test Quiz',
            total_questions: 15
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
          console.log(`✓ PUT /quizzes/${createResponse.data.data.id}: Updated to "${updateResponse.data.data.title}"`);
          
          // Delete quiz
          await axios.delete(`${API_URL}/quizzes/${createResponse.data.data.id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          console.log(`✓ DELETE /quizzes/${createResponse.data.data.id}: Deleted`);
        } else {
          console.log('⚠ Skipping quiz POST/PUT/DELETE tests (no teacher_record_id available)');
        }
      } else {
        console.log('⚠ Skipping quiz POST/PUT/DELETE tests (no course_id or teachers available)');
      }
    }
  } catch (error) {
    console.error('✗ Quiz API error:', error.response?.data?.error || error.message);
    if (error.response) {
      console.error('  Status:', error.response.status);
      console.error('  Response:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

async function testStudentGradeAPIs(token) {
  console.log('\n=== Testing Student Grade APIs ===');
  
  try {
    // Get student grades
    const getResponse = await axios.get(`${API_URL}/student-grades`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✓ GET /student-grades: ${getResponse.data.data.length} records`);
    
    if (getResponse.data.data.length > 0) {
      const firstRecord = getResponse.data.data[0];
      
      // Use course_id from existing student grade record
      const courseId = firstRecord.course_id;
      
      if (courseId) {
        // Create student grade
        const createResponse = await axios.post(`${API_URL}/student-grades`, {
          student_id: firstRecord.student_id,
          course_id: courseId,
          grade_type: 'assignment',
          score: 85,
          total_points: 100,
          letter_grade: 'B',
          term: 'Fall',
          academic_year: '2024-2025'
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`✓ POST /student-grades: Created grade ${createResponse.data.data.letter_grade}`);
        
        // Update student grade
        const updateResponse = await axios.put(`${API_URL}/student-grades/${createResponse.data.data.id}`, {
          score: 90,
          letter_grade: 'A'
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`✓ PUT /student-grades/${createResponse.data.data.id}: Updated to ${updateResponse.data.data.letter_grade}`);
        
        // Get grade report
        const reportResponse = await axios.get(`${API_URL}/student-grades/report`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`✓ GET /student-grades/report: Generated report with ${reportResponse.data.data.by_course.length} courses`);
        
        // Delete student grade
        await axios.delete(`${API_URL}/student-grades/${createResponse.data.data.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`✓ DELETE /student-grades/${createResponse.data.data.id}: Deleted`);
      } else {
        console.log('⚠ Skipping student grade POST/PUT/DELETE tests (no course_id available)');
      }
    }
  } catch (error) {
    console.error('✗ Student Grade API error:', error.response?.data?.error || error.message);
    if (error.response) {
      console.error('  Status:', error.response.status);
      console.error('  Response:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

async function runTests() {
  try {
    console.log('Starting Phase 2 Academic Features API Testing...\n');
    
    const token = await login();
    console.log('✓ Login successful');
    
    await testAttendanceAPIs(token);
    await testAssignmentAPIs(token);
    await testQuizAPIs(token);
    await testStudentGradeAPIs(token);
    
    console.log('\n=== API Testing Complete ===');
    process.exit(0);
  } catch (error) {
    console.error('\n✗ Testing failed:', error.message);
    process.exit(1);
  }
}

runTests();
