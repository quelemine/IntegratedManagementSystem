/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('curriculum', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('school_id').references('id').inTable('schools').notNullable();
    table.uuid('division_id').references('id').inTable('divisions').notNullable();
    table.uuid('subject_id').references('id').inTable('subjects').notNullable();
    table.uuid('grade_id').references('id').inTable('grades').notNullable();
    table.jsonb('topics');
    table.jsonb('learning_objectives');
    table.jsonb('resources');
    table.jsonb('assessment_methods');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('curriculum');
};
