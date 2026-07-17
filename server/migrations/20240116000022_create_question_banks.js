/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('question_banks', (table) => {
    table.string('id').primary().defaultTo(knex.raw("(lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6))))"));
    table.string('school_id').references('id').inTable('schools').notNullable();
    table.string('subject_id').references('id').inTable('subjects').notNullable();
    table.string('division_id').references('id').inTable('divisions');
    table.text('question_text').notNullable();
    table.string('question_type').notNullable();
    table.text('options');
    table.text('correct_answer');
    table.string('difficulty');
    table.text('tags');
    table.string('created_by').references('id').inTable('users');
    table.datetime('created_at').defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('question_banks');
};
