/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
  await knex('tuition_fees').del();
  await knex('payments').del();
  
  const schoolId = process.env.SEED_SCHOOL_ID || (await knex('schools').first('id')).id;
  
  // Get students and create tuition fees
  const students = await knex('students').limit(10).select('id', 'grade_id', 'division_id');
  const divisions = await knex('divisions').select('id', 'level');
  
  // Get a staff user for recorded_by
  const staffUser = await knex('users').where('email', 'accountant@simtechinstitute.edu').first('id');
  
  // Create tuition fees for each division
  for (const division of divisions) {
    const grades = await knex('grades').where('division_id', division.id).select('id');
    
    for (const grade of grades) {
      await knex('tuition_fees').insert({
        school_id: schoolId,
        division_id: division.id,
        grade_id: grade.id,
        fee_type: 'Tuition',
        amount: division.level === 'kindergarten' ? 50000 : division.level === 'elementary' ? 75000 : 100000,
        currency: 'LRD',
        academic_year: '2024-2025',
        description: 'Annual tuition fee'
      });
    }
  }
  
  // Generate sample payments
  for (const student of students) {
    const tuitionFee = await knex('tuition_fees')
      .where('grade_id', student.grade_id)
      .first();
    
    if (tuitionFee) {
      const amount = tuitionFee.amount * 0.25; // 25% payment
      const paymentMethods = ['Cash', 'Mobile Money', 'Bank Transfer'];
      
      await knex('payments').insert({
        school_id: schoolId,
        student_id: student.id,
        tuition_fee_id: tuitionFee.id,
        amount: amount,
        currency: 'LRD',
        exchange_rate: 0.0052,
        amount_usd: amount * 0.0052,
        payment_method: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
        payment_reference: `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        payment_date: new Date().toISOString().split('T')[0],
        status: 'completed',
        recorded_by: staffUser ? staffUser.id : null
      });
    }
  }
};
