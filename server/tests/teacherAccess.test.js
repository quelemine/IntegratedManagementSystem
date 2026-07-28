const request = require('supertest');
const app = require('../index');
const { db } = require('../config/database');

describe('Teacher Access Control', () => {
  let teacherUser, teacherRecord, studentRecord, teacherToken;

  beforeAll(async () => {
    const hashedPassword = await require('bcryptjs').hash('TestPassword123!', 10);
    const [teacherRole] = await db('roles').where('name', 'teacher').select('id');
    const [studentRole] = await db('roles').where('name', 'student').select('id');
    const [grade] = await db('grades').select('id').first();
    const [division] = await db('divisions').select('id').first();
    
    // Create teacher user
    [teacherUser] = await db('users').insert({
      first_name: 'Test',
      last_name: 'Teacher',
      email: 'testteacher@example.com',
      password: hashedPassword,
      role_id: teacherRole.id,
      school_id: 'test-school-id',
      is_active: true
    }).returning('*');

    // Create teacher record
    [teacherRecord] = await db('teachers').insert({
      user_id: teacherUser.id,
      school_id: 'test-school-id',
      employee_id: 'EMP001'
    }).returning('*');

    // Create student user
    const [studentUser] = await db('users').insert({
      first_name: 'Test',
      last_name: 'Student',
      email: 'teststudent3@example.com',
      password: hashedPassword,
      role_id: studentRole.id,
      school_id: 'test-school-id',
      is_active: true
    }).returning('*');

    // Create student record
    [studentRecord] = await db('students').insert({
      user_id: studentUser.id,
      student_id: 'STU001',
      grade_id: grade.id,
      division_id: division.id,
      school_id: 'test-school-id'
    }).returning('*');

    // Get teacher token
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'testteacher@example.com',
        password: 'TestPassword123!'
      });
    teacherToken = loginRes.body.data.token;
  });

  afterAll(async () => {
    await db('students').where('student_id', 'STU001').del();
    await db('teachers').where('user_id', teacherUser.id).del();
    await db('users').where('email', 'like', 'testteacher@example.com').del();
    await db('users').where('email', 'like', 'teststudent3@example.com').del();
  });

  describe('Teacher accessing class data', () => {
    it('should access class performance', async () => {
      const response = await request(app)
        .get('/academic-progress/class-performance')
        .set('Authorization', `Bearer ${teacherToken}`)
        .query({ class_id: 1 });

      expect(response.status).not.toBe(403);
    });

    it('should be able to enter grades', async () => {
      const response = await request(app)
        .post('/academic-progress/update')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          student_id: studentRecord.id,
          gpa: 3.5,
          attendance_percentage: 95
        });

      expect(response.status).not.toBe(403);
    });
  });
});
