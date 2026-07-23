/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('announcements', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('school_id').references('id').inTable('schools').notNullable();
    table.uuid('created_by').references('id').inTable('users').notNullable();
    table.string('title', 200).notNullable();
    table.text('content').notNullable();
    table.string('target_role', 50);
    table.string('priority', 20).defaultTo('normal');
    table.timestamp('publish_date').defaultTo(knex.fn.now());
    table.timestamp('expiry_date');
    table.string('status', 20).defaultTo('draft');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    table.index('school_id');
    table.index('target_role');
    table.index('status');
    table.index('publish_date');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('announcements');
};
