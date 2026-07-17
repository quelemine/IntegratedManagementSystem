/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('assignment_submissions', (table) => {
    table.string('id').primary().defaultTo(knex.raw("(lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6))))"));
    table.string('assignment_id').references('id').inTable('assignments').notNullable();
    table.string('student_id').references('id').inTable('students').notNullable();
    table.datetime('submitted_at');
    table.string('file_url');
    table.text('text_content');
    table.decimal('grade');
    table.text('feedback');
    table.string('graded_by').references('id').inTable('users');
    table.datetime('graded_at');
    table.datetime('created_at').defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('assignment_submissions');
};
