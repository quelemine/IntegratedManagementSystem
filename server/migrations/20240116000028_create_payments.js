/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('payments', (table) => {
    table.string('id').primary().defaultTo(knex.raw("(lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6))))"));
    table.string('school_id').references('id').inTable('schools').notNullable();
    table.string('student_id').references('id').inTable('students').notNullable();
    table.string('tuition_fee_id').references('id').inTable('tuition_fees');
    table.decimal('amount').notNullable();
    table.string('currency').notNullable();
    table.decimal('exchange_rate');
    table.decimal('amount_usd');
    table.string('payment_method');
    table.string('payment_reference');
    table.date('payment_date');
    table.string('status');
    table.text('remarks');
    table.string('recorded_by').references('id').inTable('users');
    table.datetime('created_at').defaultTo(knex.fn.now());
    table.datetime('updated_at').defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('payments');
};
