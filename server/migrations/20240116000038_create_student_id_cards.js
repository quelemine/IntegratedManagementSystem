/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('student_id_cards', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('school_id').references('id').inTable('schools').notNullable();
    table.uuid('student_id').references('id').inTable('students').notNullable();
    table.string('card_number').unique().notNullable();
    table.string('qr_code_data');
    table.string('qr_code_image_url');
    table.date('issue_date');
    table.date('expiry_date');
    table.string('status');
    table.uuid('generated_by').references('id').inTable('users');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('student_id_cards');
};
