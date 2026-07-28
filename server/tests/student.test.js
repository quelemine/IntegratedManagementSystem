const request = require('supertest');
const app = require('../index');
const { db } = require('../config/database');

describe('Student CRUD API', () => {
  let testUser;
  let testStudent;
  let adminToken;

  beforeAll(async () => {
    const hashedPassword = await require('bcryptjs').hash('TestPassword123!', 10);
    const [role] = await db('roles').where('name', 'admin').select('id');
    
    // Create admin user
    const [admin] = await db('users').insert({
      first_name: 'Admin',
      last_name: 'User',
      email: 'testadmin2@example.com',
      password: hashedPassword,
      role_id: role.id,
      school_id: 'test-school-id',
      is_active: true
    }).returning('*');

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'testadmin2@example.com',
        password: 'TestPassword123!'
      });
    adminToken = loginRes.body.data.token;

    // Create test user for student
    [testUser] = await db('users').insert({
      first_name: 'Test',
      last_name: 'Student',
      email: 'teststudent@example.com',
      password: hashedPassword,
      role_id: (await db('roles').where('name', 'student').select('id').first()).id,
      school_id: 'test-school-id',
      is_active: true
    }).returning('*');
  });

  afterAll(async () => {
    await db('students').where('user_id', testUser.id).del();
    await db('users').where('email', 'like', 'test%@example.com').del();
  });

  describe('POST /api/students', () => {
    it('should create a new student', async () => {
      const [grade] = await db('grades').select('id').first();
      const [division] = await db('divisions').select('id').first();
      
      const response = await request(app)
        .post('/api/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          user_id: testUser.id,
          student_id: 'STU001',
          grade_id: grade.id,
          division_id: division.id,
          enrollment_date: new Date().toISOString().split('T')[0]
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      testStudent = response.body.data;
    });

    it('should reject duplicate student_id', async () => {
      const [grade] = await db('grades').select('id').first();
      const [division] = await db('divisions').select('id').first();
      
      const response = await request(app)
        .post('/api/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          user_id: testUser.id,
          student_id: 'STU001',
          grade_id: grade.id,
          division_id: division.id
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/students', () => {
    it('should get all students', async () => {
      const response = await request(app)
        .get('/api/students')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should filter by grade', async () => {
      const response = await request(app)
        .get('/api/students?grade_id=1')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
    });
  });

  describe('GET /api/students/:id', () => {
    it('should get student by ID', async () => {
      const response = await request(app)
        .get(`/api/students/${testStudent.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('PUT /api/students/:id', () => {
    it('should update student', async () => {
      const response = await request(app)
        .put(`/api/students/${testStudent.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          student_id: 'STU002'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('DELETE /api/students/:id', () => {
    it('should delete student', async () => {
      const response = await request(app)
        .delete(`/api/students/${testStudent.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});
