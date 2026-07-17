/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('student_grades', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('school_id').references('id').inTable('schools').notNullable();
    table.uuid('student_id').references('id').inTable('students').notNullable();
    table.uuid('course_id').references('id').inTable('courses').notNullable();
    table.uuid('assignment_id').references('id').inTable('assignments');
    table.uuid('quiz_id').references('id').inTable('quizzes');
    table.uuid('exam_id').references('id').inTable('exams');
    table.string('grade_type').notNullable();
    table.decimal('score');
    table.integer('total_points');
    table.string('letter_grade');
    table.text('remarks');
    table.string('term');
    table.string('academic_year');
    table.uuid('graded_by').references('id').inTable('users');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('student_grades');
};
