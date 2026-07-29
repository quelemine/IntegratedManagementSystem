/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('leave_requests', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('school_id').references('id').inTable('schools').notNullable();
    table.uuid('staff_id').references('id').inTable('staff').notNullable();
    table.uuid('teacher_id').references('id').inTable('teachers');
    table.date('start_date').notNullable();
    table.date('end_date').notNullable();
    table.string('leave_type').notNullable();
    table.text('reason');
    table.string('status');
    table.text('remarks');
    table.uuid('approved_by').references('id').inTable('users');
    table.timestamp('approved_at');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('leave_requests');
};
