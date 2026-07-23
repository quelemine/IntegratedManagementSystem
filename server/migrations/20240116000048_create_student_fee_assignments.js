/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('student_fee_assignments', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('school_id').references('id').inTable('schools').notNullable();
    table.uuid('student_id').references('id').inTable('students').notNullable();
    table.string('fee_type', 50).notNullable(); // 'tuition', 'class_fee', 'academic_year_fee'
    table.uuid('fee_id').notNullable(); // References tuition_structures, class_fees, or academic_year_fees
    table.decimal('amount', 10, 2).notNullable();
    table.string('currency', 3).defaultTo('LRD');
    table.string('academic_year', 20).notNullable();
    table.uuid('discount_id').references('id').inTable('discounts');
    table.uuid('scholarship_id').references('id').inTable('scholarships');
    table.decimal('discounted_amount', 10, 2);
    table.decimal('final_amount', 10, 2).notNullable();
    table.date('due_date');
    table.string('status', 20).defaultTo('pending'); // 'pending', 'partial', 'paid', 'waived'
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('student_fee_assignments');
};
