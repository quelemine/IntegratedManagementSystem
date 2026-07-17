/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('question_banks', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('school_id').references('id').inTable('schools').notNullable();
    table.uuid('subject_id').references('id').inTable('subjects').notNullable();
    table.uuid('division_id').references('id').inTable('divisions');
    table.text('question_text').notNullable();
    table.string('question_type').notNullable();
    table.jsonb('options');
    table.jsonb('correct_answer');
    table.string('difficulty');
    table.jsonb('tags');
    table.uuid('created_by').references('id').inTable('users');
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('question_banks');
};
