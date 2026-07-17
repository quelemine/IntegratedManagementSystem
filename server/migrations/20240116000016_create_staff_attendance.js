/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('staff_attendance', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('school_id').references('id').inTable('schools').notNullable();
    table.uuid('staff_id').references('id').inTable('staff').notNullable();
    table.date('date').notNullable();
    table.timestamp('clock_in');
    table.timestamp('clock_out');
    table.string('status');
    table.string('leave_type');
    table.text('remarks');
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('staff_attendance');
};
