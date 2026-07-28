const request = require('supertest');
const app = require('../index');
const { db } = require('../config/database');

describe('Fees API', () => {
  let adminToken;

  beforeAll(async () => {
    const hashedPassword = await require('bcryptjs').hash('TestPassword123!', 10);
    const [role] = await db('roles').where('name', 'admin').select('id');
    
    const [admin] = await db('users').insert({
      first_name: 'Admin',
      last_name: 'User',
      email: 'testadmin3@example.com',
      password: hashedPassword,
      role_id: role.id,
      school_id: 'test-school-id',
      is_active: true
    }).returning('*');

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'testadmin3@example.com',
        password: 'TestPassword123!'
      });
    adminToken = loginRes.body.data.token;
  });

  afterAll(async () => {
    await db('users').where('email', 'like', 'testadmin3@example.com').del();
  });

  describe('GET /api/fee-categories', () => {
    it('should get fee categories', async () => {
      const response = await request(app)
        .get('/fee-categories')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('POST /api/fee-categories', () => {
    it('should create fee category', async () => {
      const response = await request(app)
        .post('/fee-categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Test Fee',
          description: 'Test fee category'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/tuition-structures', () => {
    it('should get tuition structures', async () => {
      const response = await request(app)
        .get('/tuition-structures')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/invoices', () => {
    it('should get invoices', async () => {
      const response = await request(app)
        .get('/invoices')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/payments', () => {
    it('should get payments', async () => {
      const response = await request(app)
        .get('/payments')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});
