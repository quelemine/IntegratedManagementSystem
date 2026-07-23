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
    table.string('subject', 200);
    table.text('message_body').notNullable();
    table.string('status', 20).defaultTo('sent');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    table.index('sender_id');
    table.index('receiver_id');
    table.index('school_id');
    table.index('status');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('messages');
};
