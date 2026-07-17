/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('students', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('school_id').references('id').inTable('schools').notNullable();
    table.uuid('user_id').references('id').inTable('users');
    table.string('student_id').unique().notNullable();
    table.uuid('class_id').references('id').inTable('classes');
    table.uuid('division_id').references('id').inTable('divisions');
    table.uuid('grade_id').references('id').inTable('grades');
    table.date('date_of_birth');
    table.string('gender');
    table.text('address');
    table.date('enrollment_date');
    table.string('photo_url');
    table.string('emergency_contact_name');
    table.string('emergency_contact_phone');
    table.text('medical_info');
    table.string('status');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('students');
};
