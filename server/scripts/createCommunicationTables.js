const db = require('../config/database');

async function createCommunicationTables() {
  try {
    console.log('Creating communication tables...');

    // Check and create messages table
    const messagesExists = await db.schema.hasTable('messages');
    if (!messagesExists) {
      await db.schema.createTable('messages', (table) => {
        table.uuid('id').primary().defaultTo(db.raw('gen_random_uuid()'));
        table.uuid('school_id').references('id').inTable('schools').notNullable();
        table.uuid('sender_id').references('id').inTable('users').notNullable();
        table.uuid('receiver_id').references('id').inTable('users').notNullable();
        table.string('subject', 200);
        table.text('message_body').notNullable();
        table.string('status', 20).defaultTo('sent');
        table.timestamp('created_at').defaultTo(db.fn.now());
        table.timestamp('updated_at').defaultTo(db.fn.now());
        
        table.index('sender_id');
        table.index('receiver_id');
        table.index('school_id');
        table.index('status');
      });
      console.log('✓ Messages table created');
    } else {
      console.log('✓ Messages table already exists');
    }

    // Check and create announcements table
    const announcementsExists = await db.schema.hasTable('announcements');
    if (!announcementsExists) {
      await db.schema.createTable('announcements', (table) => {
        table.uuid('id').primary().defaultTo(db.raw('gen_random_uuid()'));
        table.uuid('school_id').references('id').inTable('schools').notNullable();
        table.uuid('created_by').references('id').inTable('users').notNullable();
        table.string('title', 200).notNullable();
        table.text('content').notNullable();
        table.string('target_role', 50);
        table.string('priority', 20).defaultTo('normal');
        table.timestamp('publish_date').defaultTo(db.fn.now());
        table.timestamp('expiry_date');
        table.string('status', 20).defaultTo('draft');
        table.timestamp('created_at').defaultTo(db.fn.now());
        table.timestamp('updated_at').defaultTo(db.fn.now());
        
        table.index('school_id');
        table.index('target_role');
        table.index('status');
        table.index('publish_date');
      });
      console.log('✓ Announcements table created');
    } else {
      console.log('✓ Announcements table already exists');
    }

    // Check and create notifications table
    const notificationsExists = await db.schema.hasTable('notifications');
    if (!notificationsExists) {
      await db.schema.createTable('notifications', (table) => {
        table.uuid('id').primary().defaultTo(db.raw('gen_random_uuid()'));
        table.uuid('user_id').references('id').inTable('users').notNullable();
        table.string('title', 200).notNullable();
        table.text('message').notNullable();
        table.string('type', 50).notNullable();
        table.uuid('reference_id');
        table.string('reference_type', 50);
        table.boolean('is_read').defaultTo(false);
        table.timestamp('created_at').defaultTo(db.fn.now());
        
        table.index('user_id');
        table.index('type');
        table.index('is_read');
        table.index('created_at');
      });
      console.log('✓ Notifications table created');
    } else {
      console.log('✓ Notifications table already exists');
    }

    console.log('Communication tables created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error creating communication tables:', error);
    process.exit(1);
  }
}

createCommunicationTables();
