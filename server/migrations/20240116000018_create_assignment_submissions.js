/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('assignment_submissions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('assignment_id').references('id').inTable('assignments').notNullable();
    table.uuid('student_id').references('id').inTable('students').notNullable();
    table.timestamp('submitted_at');
    table.string('file_url');
    table.text('text_content');
    table.decimal('grade');
    table.text('feedback');
    table.uuid('graded_by').references('id').inTable('users');
    table.timestamp('graded_at');
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('assignment_submissions');
};
