/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('invoice_items', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('invoice_id').references('id').inTable('invoices').onDelete('CASCADE').notNullable();
    table.uuid('fee_assignment_id').references('id').inTable('student_fee_assignments');
    table.string('description', 200).notNullable();
    table.integer('quantity').defaultTo(1);
    table.decimal('unit_price', 10, 2).notNullable();
    table.decimal('amount', 10, 2).notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('invoice_items');
};
