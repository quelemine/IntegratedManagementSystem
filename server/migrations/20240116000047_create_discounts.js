/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('discounts', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('school_id').references('id').inTable('schools').notNullable();
    table.string('name', 100).notNullable();
    table.text('description');
    table.string('discount_type', 20).notNullable(); // 'percentage', 'fixed'
    table.decimal('discount_value', 10, 2).notNullable();
    table.string('applicable_to', 50); // 'tuition', 'all', 'specific'
    table.date('start_date');
    table.date('end_date');
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
  return knex.schema.dropTable('discounts');
};
