/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
    .alterTable('notifications', (table) => {
      table.string('category', 50).defaultTo('general');
      table.enum('priority', ['low', 'medium', 'high', 'urgent']).defaultTo('medium');
      table.timestamp('read_at').nullable();
    })
    .createTable('notification_preferences', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('user_id').references('id').inTable('users').notNullable().onDelete('CASCADE');
      table.boolean('helpdesk_notifications').defaultTo(true);
      table.boolean('fee_notifications').defaultTo(true);
      table.boolean('payment_notifications').defaultTo(true);
      table.boolean('attendance_notifications').defaultTo(true);
      table.boolean('grade_notifications').defaultTo(true);
      table.boolean('announcement_notifications').defaultTo(true);
      table.boolean('system_alerts').defaultTo(true);
      table.boolean('email_notifications').defaultTo(false);
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
      
      table.unique('user_id');
      table.index('user_id');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema
    .alterTable('notifications', (table) => {
      table.dropColumn('category');
      table.dropColumn('priority');
      table.dropColumn('read_at');
    })
    .dropTable('notification_preferences');
};
