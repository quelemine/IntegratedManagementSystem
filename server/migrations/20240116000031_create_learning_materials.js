/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('learning_materials', (table) => {
    table.string('id').primary().defaultTo(knex.raw("(lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6))))"));
    table.string('school_id').references('id').inTable('schools').notNullable();
    table.string('course_id').references('id').inTable('courses').notNullable();
    table.string('teacher_id').references('id').inTable('teachers').notNullable();
    table.string('title').notNullable();
    table.text('description');
    table.string('material_type').notNullable();
    table.string('file_url');
    table.string('file_type');
    table.integer('file_size');
    table.text('metadata');
    table.boolean('is_published').defaultTo(false);
    table.datetime('created_at').defaultTo(knex.fn.now());
    table.datetime('updated_at').defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('learning_materials');
};
