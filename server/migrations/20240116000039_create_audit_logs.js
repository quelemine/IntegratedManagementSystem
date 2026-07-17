/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('audit_logs', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('school_id').references('id').inTable('schools').notNullable();
    table.uuid('user_id').references('id').inTable('users').notNullable();
    table.string('action').notNullable();
    table.string('entity_type');
    table.uuid('entity_id');
    table.jsonb('old_values');
    table.jsonb('new_values');
    table.string('ip_address');
    table.string('user_agent');
    table.timestamp('timestamp').defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('audit_logs');
};
