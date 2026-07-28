/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
    .createTable('academic_progress', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('school_id').references('id').inTable('schools').notNullable();
      table.uuid('student_id').references('id').inTable('students').notNullable();
      table.string('term').notNullable();
      table.string('academic_year').notNullable();
      table.decimal('gpa', 3, 2);
      table.decimal('cumulative_gpa', 3, 2);
      table.decimal('attendance_percentage', 5, 2);
      table.integer('total_assignments');
      table.integer('completed_assignments');
      table.decimal('assignment_completion_rate', 5, 2);
      table.integer('total_exams');
      table.decimal('average_exam_score', 5, 2);
      table.text('teacher_comments');
      table.text('overall_performance');
      table.string('performance_level'); // excellent, good, satisfactory, needs_improvement
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
      
      table.unique(['student_id', 'term', 'academic_year']);
      table.index('student_id');
      table.index('school_id');
      table.index('academic_year');
    })
    .createTable('subject_performance', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('academic_progress_id').references('id').inTable('academic_progress').notNullable();
      table.uuid('course_id').references('id').inTable('courses').notNullable();
      table.string('subject_name').notNullable();
      table.decimal('average_score', 5, 2);
      table.string('letter_grade');
      table.decimal('attendance_percentage', 5, 2);
      table.integer('assignments_completed');
      table.integer('total_assignments');
      table.text('teacher_comments');
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
      
      table.index('academic_progress_id');
      table.index('course_id');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema
    .dropTable('subject_performance')
    .dropTable('academic_progress');
};
