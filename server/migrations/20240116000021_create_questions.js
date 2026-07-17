/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('questions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('quiz_id').references('id').inTable('quizzes');
    table.uuid('exam_id').references('id').inTable('exams');
    table.uuid('question_bank_id');
    table.text('question_text').notNullable();
    table.string('question_type').notNullable();
    table.jsonb('options');
    table.jsonb('correct_answer');
    table.integer('points');
    table.integer('order');
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('questions');
};
