/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('academic_year_fees', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('school_id').references('id').inTable('schools').notNullable();
    table.uuid('fee_category_id').references('id').inTable('fee_categories').notNullable();
    table.decimal('amount', 10, 2).notNullable();
    table.string('currency', 3).defaultTo('LRD');
    table.string('academic_year', 20).notNullable();
    table.string('student_category', 50); // e.g., 'new', 'returning', 'transfer'
    table.boolean('is_active').defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('academic_year_fees');
};
