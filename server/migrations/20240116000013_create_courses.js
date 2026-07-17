/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('courses', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('school_id').references('id').inTable('schools').notNullable();
    table.uuid('subject_id').references('id').inTable('subjects').notNullable();
    table.uuid('grade_id').references('id').inTable('grades').notNullable();
    table.uuid('teacher_id').references('id').inTable('teachers');
    table.string('name').notNullable();
    table.text('description');
    table.jsonb('syllabus');
    table.jsonb('learning_objectives');
    table.string('academic_year');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('courses');
};
