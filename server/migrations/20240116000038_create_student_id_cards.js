/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('student_id_cards', (table) => {
    table.string('id').primary().defaultTo(knex.raw("(lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6))))"));
    table.string('school_id').references('id').inTable('schools').notNullable();
    table.string('student_id').references('id').inTable('students').notNullable();
    table.string('card_number').unique().notNullable();
    table.string('qr_code_data');
    table.string('qr_code_image_url');
    table.date('issue_date');
    table.date('expiry_date');
    table.string('status');
    table.string('generated_by').references('id').inTable('users');
    table.datetime('created_at').defaultTo(knex.fn.now());
    table.datetime('updated_at').defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('student_id_cards');
};
