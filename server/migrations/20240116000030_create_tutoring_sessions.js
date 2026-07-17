/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('tutoring_sessions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('school_id').references('id').inTable('schools').notNullable();
    table.uuid('tutor_id').references('id').inTable('tutors').notNullable();
    table.uuid('student_id').references('id').inTable('students').notNullable();
    table.uuid('subject_id').references('id').inTable('subjects');
    table.timestamp('scheduled_date');
    table.integer('duration');
    table.string('status');
    table.text('notes');
    table.decimal('fee');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('tutoring_sessions');
};
