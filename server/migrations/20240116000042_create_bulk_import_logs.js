/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('bulk_import_logs', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('school_id').references('id').inTable('schools').onDelete('CASCADE');
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.string('import_type').notNullable(); // 'student', 'teacher', 'parent'
    table.integer('total_records').notNullable().defaultTo(0);
    table.integer('successful_records').notNullable().defaultTo(0);
    table.integer('failed_records').notNullable().defaultTo(0);
    table.jsonb('error_summary'); // Summary of errors
    table.jsonb('error_details'); // Detailed error list
    table.timestamp('imported_at').defaultTo(knex.fn.now());
    table.timestamps(true, true);
    
    table.index(['school_id', 'import_type']);
    table.index(['user_id']);
    table.index(['imported_at']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('bulk_import_logs');
};
