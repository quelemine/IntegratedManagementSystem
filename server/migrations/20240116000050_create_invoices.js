/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('invoices', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('school_id').references('id').inTable('schools').notNullable();
    table.uuid('student_id').references('id').inTable('students').notNullable();
    table.string('academic_year', 20).notNullable();
    table.string('invoice_number', 50).unique().notNullable();
    table.decimal('subtotal', 10, 2).notNullable();
    table.decimal('discount_amount', 10, 2).defaultTo(0);
    table.decimal('total_amount', 10, 2).notNullable();
    table.string('currency', 3).defaultTo('LRD');
    table.date('due_date').notNullable();
    table.string('status', 20).defaultTo('pending'); // 'pending', 'partial', 'paid', 'overdue', 'cancelled'
    table.text('notes');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('invoices');
};
