/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('events', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('school_id').references('id').inTable('schools').notNullable();
    table.uuid('division_id').references('id').inTable('divisions');
    table.uuid('created_by').references('id').inTable('users').notNullable();
    table.string('title').notNullable();
    table.text('description');
    table.timestamp('event_date');
    table.timestamp('end_date');
    table.string('location');
    table.jsonb('target_audience');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('events');
};
