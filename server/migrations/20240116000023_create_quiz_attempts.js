/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('quiz_attempts', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('quiz_id').references('id').inTable('quizzes').notNullable();
    table.uuid('student_id').references('id').inTable('students').notNullable();
    table.timestamp('started_at');
    table.timestamp('submitted_at');
    table.decimal('score');
    table.integer('total_points');
    table.string('status');
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('quiz_attempts');
};
