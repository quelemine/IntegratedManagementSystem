const request = require('supertest');
const app = require('../index');
const { db } = require('../config/database');

describe('Parent Access Control', () => {
  let parentUser, parentRecord, studentUser, studentRecord, parentToken;

  beforeAll(async () => {
    const hashedPassword = await require('bcryptjs').hash('TestPassword123!', 10);
    const [parentRole] = await db('roles').where('name', 'parent').select('id');
    const [studentRole] = await db('roles').where('name', 'student').select('id');
    const [grade] = await db('grades').select('id').first();
    const [division] = await db('divisions').select('id').first();
    
    // Create parent user
    [parentUser] = await db('users').insert({
      first_name: 'Test',
      last_name: 'Parent',
      email: 'testparent@example.com',
      password: hashedPassword,
      role_id: parentRole.id,
      school_id: 'test-school-id',
      is_active: true
    }).returning('*');

    // Create parent record
    [parentRecord] = await db('parents').insert({
      user_id: parentUser.id,
      school_id: 'test-school-id',
      relationship: 'Father'
    }).returning('*');

    // Create student user
    [studentUser] = await db('users').insert({
      first_name: 'Test',
      last_name: 'Student',
      email: 'teststudent2@example.com',
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

    // Link parent to student
    await db('parent_student_relationships').insert({
      parent_id: parentRecord.id,
      student_id: studentRecord.id
    });

    // Get parent token
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'testparent@example.com',
        password: 'TestPassword123!'
      });
    parentToken = loginRes.body.data.token;
  });

  afterAll(async () => {
    await db('parent_student_relationships').where('parent_id', parentRecord.id).del();
    await db('students').where('user_id', studentUser.id).del();
    await db('parents').where('user_id', parentUser.id).del();
    await db('users').where('email', 'like', 'testparent@example.com').del();
    await db('users').where('email', 'like', 'teststudent2@example.com').del();
  });

  describe('Parent accessing their children', () => {
    it('should access their own child data', async () => {
      const response = await request(app)
        .get(`/academic-progress/student/${studentRecord.id}`)
        .set('Authorization', `Bearer ${parentToken}`);

      expect(response.status).not.toBe(403);
    });

    it('should be denied access to non-child data', async () => {
      // Create another student not linked to parent
      const [otherStudent] = await db('students').insert({
        user_id: parentUser.id,
        student_id: 'STU999',
        grade_id: studentRecord.grade_id,
        division_id: studentRecord.division_id,
        school_id: 'test-school-id'
      }).returning('*');

      const response = await request(app)
        .get(`/academic-progress/student/${otherStudent.id}`)
        .set('Authorization', `Bearer ${parentToken}`);

      expect(response.status).toBe(403);
      
      await db('students').where('id', otherStudent.id).del();
    });
  });

  describe('Parent API endpoints', () => {
    it('should get their children', async () => {
      const response = await request(app)
        .get('/parents/my-children')
        .set('Authorization', `Bearer ${parentToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });
});
