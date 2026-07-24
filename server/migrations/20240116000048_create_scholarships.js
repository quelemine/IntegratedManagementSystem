/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('scholarships', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('school_id').references('id').inTable('schools').notNullable();
    table.string('name', 100).notNullable();
    table.text('description');
    table.string('scholarship_type', 50).notNullable(); // 'merit', 'need', 'athletic'
    table.decimal('coverage_percentage', 5, 2); // Percentage of fees covered
    table.decimal('max_amount', 10, 2);
    table.string('academic_year', 20).notNullable();
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
  return knex.schema.dropTable('scholarships');
};
