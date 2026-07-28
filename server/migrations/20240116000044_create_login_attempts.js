/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('login_attempts', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').references('id').inTable('users').nullable();
    table.string('email').notNullable();
    table.string('ip_address');
    table.string('user_agent');
    table.boolean('success').defaultTo(false);
    table.string('failure_reason');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    
    // Index for efficient queries
    table.index('email');
    table.index('ip_address');
    table.index('created_at');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('login_attempts');
};
