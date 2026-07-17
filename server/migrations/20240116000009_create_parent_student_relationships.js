/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('parent_student_relationships', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('parent_id').references('id').inTable('parents').notNullable();
    table.uuid('student_id').references('id').inTable('students').notNullable();
    table.boolean('is_primary').defaultTo(false);
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('parent_student_relationships');
};
