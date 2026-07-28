/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable('parent_student_relationships', (table) => {
    table.string('relationship_type').defaultTo('guardian').after('is_primary');
    table.index(['parent_id', 'student_id']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('parent_student_relationships', (table) => {
    table.dropColumn('relationship_type');
  });
};
