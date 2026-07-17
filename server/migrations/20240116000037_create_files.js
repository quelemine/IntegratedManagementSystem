/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('files', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('school_id').references('id').inTable('schools').notNullable();
    table.uuid('uploaded_by').references('id').inTable('users').notNullable();
    table.string('file_name').notNullable();
    table.string('file_path').notNullable();
    table.integer('file_size');
    table.string('file_type');
    table.string('category');
    table.string('related_entity_type');
    table.uuid('related_entity_id');
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('files');
};
