/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('learning_materials', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('school_id').references('id').inTable('schools').notNullable();
    table.uuid('course_id').references('id').inTable('courses').notNullable();
    table.uuid('teacher_id').references('id').inTable('teachers').notNullable();
    table.string('title').notNullable();
    table.text('description');
    table.string('material_type').notNullable();
    table.string('file_url');
    table.string('file_type');
    table.integer('file_size');
    table.jsonb('metadata');
    table.boolean('is_published').defaultTo(false);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('learning_materials');
};
