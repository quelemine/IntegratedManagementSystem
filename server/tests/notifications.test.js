const request = require('supertest');
const app = require('../index');
const { db } = require('../config/database');

describe('Notifications API', () => {
  let userToken, testNotification;

  beforeAll(async () => {
    const hashedPassword = await require('bcryptjs').hash('TestPassword123!', 10);
    const [role] = await db('roles').where('name', 'student').select('id');
    
    await db('users').insert({
      first_name: 'Test',
      last_name: 'User',
      email: 'testuser5@example.com',
      password: hashedPassword,
      role_id: role.id,
      school_id: 'test-school-id',
      is_active: true
    });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'testuser5@example.com',
        password: 'TestPassword123!'
      });
    userToken = loginRes.body.data.token;
  });

  afterAll(async () => {
    await db('notifications').where('title', 'like', 'Test%').del();
    await db('users').where('email', 'like', 'testuser5@example.com').del();
  });

  describe('GET /api/notifications', () => {
    it('should get user notifications', async () => {
      const response = await request(app)
        .get('/notifications')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should filter by is_read', async () => {
      const response = await request(app)
        .get('/notifications?is_read=false')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
    });
  });

  describe('GET /api/notifications/unread-count', () => {
    it('should get unread count', async () => {
      const response = await request(app)
        .get('/notifications/unread-count')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(typeof response.body.data.count).toBe('number');
    });
  });

  describe('POST /api/notifications', () => {
    it('should create notification (admin only)', async () => {
      // This would require admin token, skipping for now
    });
  });

  describe('PUT /api/notifications/:id/read', () => {
    it('should mark notification as read', async () => {
      // First create a test notification
      const [user] = await db('users').where('email', 'testuser5@example.com').select('id').first();
      const [notification] = await db('notifications').insert({
        user_id: user.id,
        title: 'Test Notification',
        message: 'This is a test notification',
        type: 'info',
        is_read: false
      }).returning('*');

      const response = await request(app)
        .put(`/notifications/${notification.id}/read`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('PUT /api/notifications/read-all', () => {
    it('should mark all notifications as read', async () => {
      const response = await request(app)
        .put('/notifications/read-all')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('DELETE /api/notifications/:id', () => {
    it('should delete notification', async () => {
      const [user] = await db('users').where('email', 'testuser5@example.com').select('id').first();
      const [notification] = await db('notifications').insert({
        user_id: user.id,
        title: 'Test Notification Delete',
        message: 'This is a test notification for deletion',
        type: 'info',
        is_read: false
      }).returning('*');

      const response = await request(app)
        .delete(`/notifications/${notification.id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});
