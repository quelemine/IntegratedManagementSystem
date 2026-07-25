/**
 * Migration to add database indexes for performance optimization
 */

exports.up = function(knex) {
  return knex.schema
    // Users table indexes
    .table('users', function(table) {
      table.index('email');
      table.index('role_id');
      table.index('school_id');
      table.index('is_active');
    })
    
    // Students table indexes
    .table('students', function(table) {
      table.index('user_id');
      table.index('school_id');
      table.index('class_id');
      table.index('grade_id');
      table.index('division_id');
      table.index('student_id');
    })
    
    // Teachers table indexes
    .table('teachers', function(table) {
      table.index('user_id');
      table.index('school_id');
    })
    
    // Classes table indexes
    .table('classes', function(table) {
      table.index('school_id');
      table.index('grade_id');
    })
    
    // Attendance table indexes
    .table('attendance', function(table) {
      table.index('student_id');
      table.index('class_id');
      table.index('date');
      table.index('school_id');
    })
    
    // Assignments table indexes
    .table('assignments', function(table) {
      table.index('course_id');
      table.index('school_id');
      table.index('due_date');
    })
    
    // Messages table indexes
    .table('messages', function(table) {
      table.index('sender_id');
      table.index('receiver_id');
      table.index('school_id');
      table.index('is_read');
      table.index('created_at');
    })
    
    // Announcements table indexes
    .table('announcements', function(table) {
      table.index('school_id');
      table.index('created_by');
      table.index('publish_date');
      table.index('expiry_date');
      table.index('is_active');
    })
    
    
    // Invoices table indexes
    .table('invoices', function(table) {
      table.index('student_id');
      table.index('school_id');
      table.index('status');
      table.index('due_date');
    })
    
    // Payments table indexes
    .table('payments', function(table) {
      table.index('school_id');
      table.index('payment_date');
      table.index('status');
    });
};

exports.down = function(knex) {
  return knex.schema
    .table('users', function(table) {
      table.dropIndex('email');
      table.dropIndex('role_id');
      table.dropIndex('school_id');
      table.dropIndex('is_active');
    })
    .table('students', function(table) {
      table.dropIndex('user_id');
      table.dropIndex('school_id');
      table.dropIndex('class_id');
      table.dropIndex('grade_id');
      table.dropIndex('division_id');
      table.dropIndex('student_id');
    })
    .table('teachers', function(table) {
      table.dropIndex('user_id');
      table.dropIndex('school_id');
    })
    .table('classes', function(table) {
      table.dropIndex('school_id');
      table.dropIndex('grade_id');
    })
    .table('attendance', function(table) {
      table.dropIndex('student_id');
      table.dropIndex('class_id');
      table.dropIndex('date');
      table.dropIndex('school_id');
    })
    .table('assignments', function(table) {
      table.dropIndex('course_id');
      table.dropIndex('school_id');
      table.dropIndex('due_date');
    })
    .table('messages', function(table) {
      table.dropIndex('sender_id');
      table.dropIndex('receiver_id');
      table.dropIndex('school_id');
      table.dropIndex('is_read');
      table.dropIndex('created_at');
    })
    .table('announcements', function(table) {
      table.dropIndex('school_id');
      table.dropIndex('created_by');
      table.dropIndex('publish_date');
      table.dropIndex('expiry_date');
      table.dropIndex('is_active');
    })
    .table('invoices', function(table) {
      table.dropIndex('student_id');
      table.dropIndex('school_id');
      table.dropIndex('status');
      table.dropIndex('due_date');
    })
    .table('payments', function(table) {
      table.dropIndex('school_id');
      table.dropIndex('payment_date');
      table.dropIndex('status');
    });
};
