const request = require('supertest');
const app = require('../index');
const { db } = require('../config/database');

describe('HelpDesk Messaging API', () => {
  let adminToken, userToken;
  let testTicket;

  beforeAll(async () => {
    const hashedPassword = await require('bcryptjs').hash('TestPassword123!', 10);
    const [adminRole] = await db('roles').where('name', 'admin').select('id');
    const [userRole] = await db('roles').where('name', 'student').select('id');
    
    // Create admin user
    await db('users').insert({
      first_name: 'Admin',
      last_name: 'User',
      email: 'testadmin4@example.com',
      password: hashedPassword,
      role_id: adminRole.id,
      school_id: 'test-school-id',
      is_active: true
    });

    // Create regular user
    await db('users').insert({
      first_name: 'Test',
      last_name: 'User',
      email: 'testuser4@example.com',
      password: hashedPassword,
      role_id: userRole.id,
      school_id: 'test-school-id',
      is_active: true
    });

    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'testadmin4@example.com',
        password: 'TestPassword123!'
      });
    adminToken = adminLogin.body.data.token;

    const userLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'testuser4@example.com',
        password: 'TestPassword123!'
      });
    userToken = userLogin.body.data.token;
  });

  afterAll(async () => {
    await db('helpdesk_tickets').where('title', 'like', 'Test%').del();
    await db('users').where('email', 'like', 'testadmin4@example.com').del();
    await db('users').where('email', 'like', 'testuser4@example.com').del();
  });

  describe('POST /api/helpdesk/tickets', () => {
    it('should create a new ticket', async () => {
      const response = await request(app)
        .post('/helpdesk/tickets')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Test Ticket',
          description: 'This is a test ticket',
          category: 'general',
          priority: 'medium'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      testTicket = response.body.data;
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/helpdesk/tickets')
        .send({
          title: 'Test Ticket',
          description: 'This is a test ticket'
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/helpdesk/tickets', () => {
    it('should get all tickets', async () => {
      const response = await request(app)
        .get('/helpdesk/tickets')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should filter by status', async () => {
      const response = await request(app)
        .get('/helpdesk/tickets?status=open')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
    });
  });

  describe('GET /api/helpdesk/tickets/:id', () => {
    it('should get ticket by ID', async () => {
      const response = await request(app)
        .get(`/helpdesk/tickets/${testTicket.id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('POST /api/helpdesk/tickets/:id/messages', () => {
    it('should add message to ticket', async () => {
      const response = await request(app)
        .post(`/helpdesk/tickets/${testTicket.id}/messages`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          content: 'This is a test message'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });
  });

  describe('PUT /api/helpdesk/tickets/:id', () => {
    it('should update ticket status', async () => {
      const response = await request(app)
        .put(`/helpdesk/tickets/${testTicket.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'resolved'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});
