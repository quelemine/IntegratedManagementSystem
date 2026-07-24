/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable('payments', (table) => {
    table.uuid('invoice_id').references('id').inTable('invoices').nullable();
    table.uuid('received_by').references('id').inTable('users').nullable().alter();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('payments', (table) => {
    table.dropColumn('invoice_id');
  });
};
