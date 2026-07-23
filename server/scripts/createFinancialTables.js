require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const db = require('../config/database');

async function createFinancialTables() {
  try {
    console.log('Creating Phase 3 Financial Features tables...\n');

    // Create fee_categories table
    if (!(await db.schema.hasTable('fee_categories'))) {
      await db.schema.createTable('fee_categories', (table) => {
        table.uuid('id').primary().defaultTo(db.raw('gen_random_uuid()'));
        table.uuid('school_id').references('id').inTable('schools').notNullable();
        table.string('name', 100).notNullable();
        table.text('description');
        table.boolean('is_active').defaultTo(true);
        table.timestamp('created_at').defaultTo(db.fn.now());
        table.timestamp('updated_at').defaultTo(db.fn.now());
      });
      console.log('✓ Created fee_categories table');
    } else {
      console.log('✓ fee_categories table already exists');
    }

    // Create tuition_structures table
    if (!(await db.schema.hasTable('tuition_structures'))) {
      await db.schema.createTable('tuition_structures', (table) => {
        table.uuid('id').primary().defaultTo(db.raw('gen_random_uuid()'));
        table.uuid('school_id').references('id').inTable('schools').notNullable();
        table.uuid('grade_id').references('id').inTable('grades').notNullable();
        table.string('name', 100).notNullable();
        table.decimal('amount', 10, 2).notNullable();
        table.string('currency', 3).defaultTo('LRD');
        table.string('academic_year', 20).notNullable();
        table.boolean('is_active').defaultTo(true);
        table.timestamp('created_at').defaultTo(db.fn.now());
        table.timestamp('updated_at').defaultTo(db.fn.now());
      });
      console.log('✓ Created tuition_structures table');
    } else {
      console.log('✓ tuition_structures table already exists');
    }

    // Create class_fees table
    if (!(await db.schema.hasTable('class_fees'))) {
      await db.schema.createTable('class_fees', (table) => {
        table.uuid('id').primary().defaultTo(db.raw('gen_random_uuid()'));
        table.uuid('school_id').references('id').inTable('schools').notNullable();
        table.uuid('class_id').references('id').inTable('classes').notNullable();
        table.uuid('fee_category_id').references('id').inTable('fee_categories').notNullable();
        table.decimal('amount', 10, 2).notNullable();
        table.string('currency', 3).defaultTo('LRD');
        table.string('academic_year', 20).notNullable();
        table.boolean('is_active').defaultTo(true);
        table.timestamp('created_at').defaultTo(db.fn.now());
        table.timestamp('updated_at').defaultTo(db.fn.now());
      });
      console.log('✓ Created class_fees table');
    } else {
      console.log('✓ class_fees table already exists');
    }

    // Create academic_year_fees table
    if (!(await db.schema.hasTable('academic_year_fees'))) {
      await db.schema.createTable('academic_year_fees', (table) => {
        table.uuid('id').primary().defaultTo(db.raw('gen_random_uuid()'));
        table.uuid('school_id').references('id').inTable('schools').notNullable();
        table.uuid('fee_category_id').references('id').inTable('fee_categories').notNullable();
        table.decimal('amount', 10, 2).notNullable();
        table.string('currency', 3).defaultTo('LRD');
        table.string('academic_year', 20).notNullable();
        table.string('student_category', 50);
        table.boolean('is_active').defaultTo(true);
        table.timestamp('created_at').defaultTo(db.fn.now());
        table.timestamp('updated_at').defaultTo(db.fn.now());
      });
      console.log('✓ Created academic_year_fees table');
    } else {
      console.log('✓ academic_year_fees table already exists');
    }

    // Create discounts table
    if (!(await db.schema.hasTable('discounts'))) {
      await db.schema.createTable('discounts', (table) => {
        table.uuid('id').primary().defaultTo(db.raw('gen_random_uuid()'));
        table.uuid('school_id').references('id').inTable('schools').notNullable();
        table.string('name', 100).notNullable();
        table.text('description');
        table.string('discount_type', 20).notNullable();
        table.decimal('discount_value', 10, 2).notNullable();
        table.string('applicable_to', 50);
        table.date('start_date');
        table.date('end_date');
        table.boolean('is_active').defaultTo(true);
        table.timestamp('created_at').defaultTo(db.fn.now());
        table.timestamp('updated_at').defaultTo(db.fn.now());
      });
      console.log('✓ Created discounts table');
    } else {
      console.log('✓ discounts table already exists');
    }

    // Create scholarships table
    if (!(await db.schema.hasTable('scholarships'))) {
      await db.schema.createTable('scholarships', (table) => {
        table.uuid('id').primary().defaultTo(db.raw('gen_random_uuid()'));
        table.uuid('school_id').references('id').inTable('schools').notNullable();
        table.string('name', 100).notNullable();
        table.text('description');
        table.string('scholarship_type', 50).notNullable();
        table.decimal('coverage_percentage', 5, 2);
        table.decimal('max_amount', 10, 2);
        table.string('academic_year', 20).notNullable();
        table.boolean('is_active').defaultTo(true);
        table.timestamp('created_at').defaultTo(db.fn.now());
        table.timestamp('updated_at').defaultTo(db.fn.now());
      });
      console.log('✓ Created scholarships table');
    } else {
      console.log('✓ scholarships table already exists');
    }

    // Create student_fee_assignments table
    if (!(await db.schema.hasTable('student_fee_assignments'))) {
      await db.schema.createTable('student_fee_assignments', (table) => {
        table.uuid('id').primary().defaultTo(db.raw('gen_random_uuid()'));
        table.uuid('school_id').references('id').inTable('schools').notNullable();
        table.uuid('student_id').references('id').inTable('students').notNullable();
        table.string('fee_type', 50).notNullable();
        table.uuid('fee_id').notNullable();
        table.decimal('amount', 10, 2).notNullable();
        table.string('currency', 3).defaultTo('LRD');
        table.string('academic_year', 20).notNullable();
        table.uuid('discount_id').references('id').inTable('discounts');
        table.uuid('scholarship_id').references('id').inTable('scholarships');
        table.decimal('discounted_amount', 10, 2);
        table.decimal('final_amount', 10, 2).notNullable();
        table.date('due_date');
        table.string('status', 20).defaultTo('pending');
        table.timestamp('created_at').defaultTo(db.fn.now());
        table.timestamp('updated_at').defaultTo(db.fn.now());
      });
      console.log('✓ Created student_fee_assignments table');
    } else {
      console.log('✓ student_fee_assignments table already exists');
    }

    // Create invoices table
    if (!(await db.schema.hasTable('invoices'))) {
      await db.schema.createTable('invoices', (table) => {
        table.uuid('id').primary().defaultTo(db.raw('gen_random_uuid()'));
        table.uuid('school_id').references('id').inTable('schools').notNullable();
        table.uuid('student_id').references('id').inTable('students').notNullable();
        table.string('academic_year', 20).notNullable();
        table.string('invoice_number', 50).unique().notNullable();
        table.decimal('subtotal', 10, 2).notNullable();
        table.decimal('discount_amount', 10, 2).defaultTo(0);
        table.decimal('total_amount', 10, 2).notNullable();
        table.string('currency', 3).defaultTo('LRD');
        table.date('due_date').notNullable();
        table.string('status', 20).defaultTo('pending');
        table.text('notes');
        table.timestamp('created_at').defaultTo(db.fn.now());
        table.timestamp('updated_at').defaultTo(db.fn.now());
      });
      console.log('✓ Created invoices table');
    } else {
      console.log('✓ invoices table already exists');
    }

    // Create invoice_items table
    if (!(await db.schema.hasTable('invoice_items'))) {
      await db.schema.createTable('invoice_items', (table) => {
        table.uuid('id').primary().defaultTo(db.raw('gen_random_uuid()'));
        table.uuid('invoice_id').references('id').inTable('invoices').onDelete('CASCADE').notNullable();
        table.uuid('fee_assignment_id').references('id').inTable('student_fee_assignments');
        table.string('description', 200).notNullable();
        table.integer('quantity').defaultTo(1);
        table.decimal('unit_price', 10, 2).notNullable();
        table.decimal('amount', 10, 2).notNullable();
        table.timestamp('created_at').defaultTo(db.fn.now());
      });
      console.log('✓ Created invoice_items table');
    } else {
      console.log('✓ invoice_items table already exists');
    }

    // Add invoice_id column to payments table if it doesn't exist
    if (!(await db.schema.hasColumn('payments', 'invoice_id'))) {
      await db.schema.alterTable('payments', (table) => {
        table.uuid('invoice_id').references('id').inTable('invoices').nullable();
      });
      console.log('✓ Added invoice_id column to payments table');
    } else {
      console.log('✓ payments.invoice_id column already exists');
    }

    console.log('\n✓ All Phase 3 Financial Features tables created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error creating tables:', error.message);
    process.exit(1);
  }
}

createFinancialTables();
