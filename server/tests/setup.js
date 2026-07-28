const { db } = require('../config/database');

// Setup test database
beforeAll(async () => {
  // Ensure test database is clean
  try {
    // Rollback any existing migrations
    await db.migrate.rollback();
    // Run migrations
    await db.migrate.latest();
  } catch (error) {
    console.error('Test setup error:', error);
  }
});

// Cleanup after all tests
afterAll(async () => {
  await db.destroy();
});

// Cleanup after each test
afterEach(async () => {
  // Clean up test data
  const tables = [
    'payments',
    'invoice_items',
    'invoices',
    'student_fee_assignments',
    'helpdesk_tickets',
    'messages',
    'notifications',
    'parent_student_relationships',
    'students',
    'parents',
    'users'
  ];
  
  for (const table of tables) {
    try {
      await db(table).where('email', 'like', 'test%@example.com').del();
    } catch (error) {
      // Table might not exist, continue
    }
  }
});
