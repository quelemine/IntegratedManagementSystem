/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('quizzes', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('school_id').references('id').inTable('schools').notNullable();
    table.uuid('course_id').references('id').inTable('courses').notNullable();
    table.uuid('teacher_id').references('id').inTable('teachers').notNullable();
    table.string('title').notNullable();
    table.text('description');
    table.integer('duration');
    table.integer('total_questions');
    table.integer('total_points');
    table.timestamp('start_date');
    table.timestamp('end_date');
    table.boolean('shuffle_questions').defaultTo(false);
    table.boolean('show_results_immediately').defaultTo(false);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('quizzes');
};
