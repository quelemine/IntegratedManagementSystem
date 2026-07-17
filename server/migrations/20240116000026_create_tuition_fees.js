/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('tuition_fees', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('school_id').references('id').inTable('schools').notNullable();
    table.uuid('division_id').references('id').inTable('divisions').notNullable();
    table.uuid('grade_id').references('id').inTable('grades').notNullable();
    table.string('fee_type').notNullable();
    table.decimal('amount').notNullable();
    table.string('currency').notNullable();
    table.string('academic_year').notNullable();
    table.text('description');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('tuition_fees');
};
