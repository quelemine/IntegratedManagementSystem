/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('student_grades', (table) => {
    table.string('id').primary().defaultTo(knex.raw("(lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6))))"));
    table.string('school_id').references('id').inTable('schools').notNullable();
    table.string('student_id').references('id').inTable('students').notNullable();
    table.string('course_id').references('id').inTable('courses').notNullable();
    table.string('assignment_id').references('id').inTable('assignments');
    table.string('quiz_id').references('id').inTable('quizzes');
    table.string('exam_id').references('id').inTable('exams');
    table.string('grade_type').notNullable();
    table.decimal('score');
    table.integer('total_points');
    table.string('letter_grade');
    table.text('remarks');
    table.string('term');
    table.string('academic_year');
    table.string('graded_by').references('id').inTable('users');
    table.datetime('created_at').defaultTo(knex.fn.now());
    table.datetime('updated_at').defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('student_grades');
};
