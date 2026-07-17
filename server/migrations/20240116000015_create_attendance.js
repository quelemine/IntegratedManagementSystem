/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('attendance', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('school_id').references('id').inTable('schools').notNullable();
    table.uuid('student_id').references('id').inTable('students').notNullable();
    table.uuid('class_id').references('id').inTable('classes').notNullable();
    table.date('date').notNullable();
    table.string('status').notNullable();
    table.text('remarks');
    table.uuid('recorded_by').references('id').inTable('users');
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('attendance');
};
