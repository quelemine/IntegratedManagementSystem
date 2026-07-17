/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('messages', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('school_id').references('id').inTable('schools').notNullable();
    table.uuid('sender_id').references('id').inTable('users').notNullable();
    table.uuid('receiver_id').references('id').inTable('users').notNullable();
    table.uuid('parent_id').references('id').inTable('messages');
    table.text('content').notNullable();
    table.boolean('is_read').defaultTo(false);
    table.timestamp('read_at');
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('messages');
};
