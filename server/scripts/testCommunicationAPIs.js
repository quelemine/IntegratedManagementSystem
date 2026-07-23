const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testCommunicationAPIs() {
  let token;
  let userId;

  try {
    console.log('=== Testing Phase 4 Communication Features APIs ===\n');

    // Login
    console.log('--- Login ---');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'principal.elementary@simtechinstitute.edu',
      password: 'Password123!'
    });
    token = loginResponse.data.data.token;
    userId = loginResponse.data.data.user.id;
    console.log('✓ Login successful\n');

    // Test Messages
    console.log('--- Testing Messages ---');
    
    // Get messages
    const messagesResponse = await axios.get(`${API_URL}/messages`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✓ GET /messages: ${messagesResponse.data.data.length} messages`);

    // Get unread count
    const unreadResponse = await axios.get(`${API_URL}/notifications/unread-count`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✓ GET /notifications/unread-count: ${unreadResponse.data.data.count} unread notifications`);

    // Test Announcements
    console.log('\n--- Testing Announcements ---');
    
    // Get announcements
    const announcementsResponse = await axios.get(`${API_URL}/announcements`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✓ GET /announcements: ${announcementsResponse.data.data.length} announcements`);

    // Test Notifications
    console.log('\n--- Testing Notifications ---');
    
    // Get notifications
    const notificationsResponse = await axios.get(`${API_URL}/notifications`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✓ GET /notifications: ${notificationsResponse.data.data.length} notifications`);

    // Create a test message
    console.log('\n--- Testing Create Message ---');
    
    // Get a teacher to send message to
    const usersResponse = await axios.get(`${API_URL}/users`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const teacher = usersResponse.data.data.find(u => u.role === 'teacher');
    
    if (teacher) {
      const createMessageResponse = await axios.post(`${API_URL}/messages`, {
        receiver_id: teacher.id,
        content: 'This is a test message from the communication API test.'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(`✓ POST /messages: Message created successfully`);
      
      // Mark message as read
      await axios.put(`${API_URL}/messages/${createMessageResponse.data.data.id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(`✓ PUT /messages/:id/read: Message marked as read`);
    }

    // Create a test announcement (as principal)
    console.log('\n--- Testing Create Announcement ---');
    try {
      const createAnnouncementResponse = await axios.post(`${API_URL}/announcements`, {
        title: 'Test Announcement',
        content: 'This is a test announcement from the communication API test.',
        target_audience: { roles: ['all'] }
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(`✓ POST /announcements: Announcement created successfully`);
    } catch (error) {
      console.log(`✗ POST /announcements: ${error.response?.data?.error || error.message}`);
    }

    // Mark all notifications as read
    await axios.put(`${API_URL}/notifications/mark-all-read`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✓ PUT /notifications/mark-all-read: All notifications marked as read`);

    console.log('\n=== Communication API Testing Complete ===');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    process.exit(1);
  }
}

testCommunicationAPIs();
