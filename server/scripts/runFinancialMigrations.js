require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const db = require('../config/database');

async function runMigrations() {
  try {
    console.log('Running Phase 3 Financial Features migrations...\n');

    // Check if tables already exist
    const tables = [
      'fee_categories',
      'tuition_structures', 
      'class_fees',
      'academic_year_fees',
      'discounts',
      'scholarships',
      'student_fee_assignments',
      'invoices',
      'invoice_items'
    ];

    for (const tableName of tables) {
      const exists = await db.schema.hasTable(tableName);
      if (exists) {
        console.log(`✓ Table '${tableName}' already exists`);
      } else {
        console.log(`✗ Table '${tableName}' does not exist - needs migration`);
      }
    }

    // Check if payments table has invoice_id column
    const hasInvoiceId = await db.schema.hasColumn('payments', 'invoice_id');
    if (hasInvoiceId) {
      console.log('✓ payments.invoice_id column exists');
    } else {
      console.log('✗ payments.invoice_id column missing - needs migration');
    }

    console.log('\nMigration check complete.');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

runMigrations();
