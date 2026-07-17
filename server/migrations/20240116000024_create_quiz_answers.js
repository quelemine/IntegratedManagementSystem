/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('quiz_answers', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('attempt_id').references('id').inTable('quiz_attempts').notNullable();
    table.uuid('question_id').references('id').inTable('questions').notNullable();
    table.text('answer');
    table.boolean('is_correct');
    table.integer('points_earned');
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('quiz_answers');
};
