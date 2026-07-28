const request = require('supertest');
const app = require('../index');
const { db } = require('../config/database');

describe('User CRUD API', () => {
  let testUser;
  let authToken;
  let adminToken;

  beforeAll(async () => {
    const hashedPassword = await require('bcryptjs').hash('TestPassword123!', 10);
    const [role] = await db('roles').where('name', 'admin').select('id');
    
    // Create admin user for authentication
    const [admin] = await db('users').insert({
      first_name: 'Admin',
      last_name: 'User',
      email: 'testadmin@example.com',
      password: hashedPassword,
      role_id: role.id,
      school_id: 'test-school-id',
      is_active: true
    }).returning('*');

    // Get admin token
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'testadmin@example.com',
        password: 'TestPassword123!'
      });
    adminToken = loginRes.body.data.token;
  });

  afterAll(async () => {
    await db('users').where('email', 'like', 'test%@example.com').del();
  });

  describe('POST /api/users', () => {
    it('should create a new user', async () => {
      const [role] = await db('roles').where('name', 'teacher').select('id');
      
      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          first_name: 'Test',
          last_name: 'Teacher',
          email: 'testuser@example.com',
          password: 'TestPassword123!',
          role_id: role.id,
          school_id: 'test-school-id'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe('testuser@example.com');
      testUser = response.body.data;
    });

    it('should reject duplicate email', async () => {
      const [role] = await db('roles').where('name', 'teacher').select('id');
      
      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          first_name: 'Test',
          last_name: 'Teacher',
          email: 'testuser@example.com',
          password: 'TestPassword123!',
          role_id: role.id,
          school_id: 'test-school-id'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({
          first_name: 'Test',
          last_name: 'Teacher',
          email: 'testuser2@example.com',
          password: 'TestPassword123!'
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/users', () => {
    it('should get all users', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should filter by role', async () => {
      const response = await request(app)
        .get('/api/users?role=teacher')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/users/:id', () => {
    it('should get user by ID', async () => {
      const response = await request(app)
        .get(`/api/users/${testUser.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testUser.id);
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .get('/api/users/non-existent-id')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/users/:id', () => {
    it('should update user', async () => {
      const response = await request(app)
        .put(`/api/users/${testUser.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          first_name: 'Updated',
          last_name: 'Name'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.first_name).toBe('Updated');
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should delete user', async () => {
      const response = await request(app)
        .delete(`/api/users/${testUser.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 404 for deleted user', async () => {
      const response = await request(app)
        .get(`/api/users/${testUser.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
    });
  });
});
