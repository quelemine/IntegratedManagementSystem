const db = require('../config/database');

/**
 * Student balances report
 */
const getStudentBalances = async (req, res) => {
  try {
    const { academic_year, status } = req.query;
    const schoolId = req.user.school_id;

    let query = db('invoices')
      .select(
        'invoices.student_id',
        'users.first_name',
        'users.last_name',
        'students.student_id as student_number',
        'students.class_id',
        'classes.name as class_name',
        db.raw('SUM(invoices.total_amount) as total_billed'),
        db.raw('COALESCE(SUM(payments.amount), 0) as total_paid'),
        db.raw('SUM(invoices.total_amount) - COALESCE(SUM(payments.amount), 0) as balance_due')
      )
      .join('students', 'invoices.student_id', 'students.id')
      .leftJoin('users', 'students.user_id', 'users.id')
      .leftJoin('classes', 'students.class_id', 'classes.id')
      .leftJoin('payments', function() {
        this.on('payments.invoice_id', 'invoices.id')
          .andOn('payments.status', '=', db.raw('?', ['completed']));
      })
      .where('invoices.school_id', schoolId)
      .groupBy('invoices.student_id', 'users.first_name', 'users.last_name', 'students.student_id', 'students.class_id', 'classes.name')
      .orderBy('balance_due', 'desc');

    if (academic_year) {
      query = query.where('invoices.academic_year', academic_year);
    }

    if (status) {
      if (status === 'overdue') {
        query = query.where('invoices.due_date', '<', new Date())
          .whereNot('invoices.status', 'paid');
      } else if (status === 'paid') {
        query = query.where('invoices.status', 'paid');
      } else if (status === 'pending') {
        query = query.where('invoices.status', 'pending');
      }
    }

    const balances = await query.orderBy('balance_due', 'desc');

    res.json({
      success: true,
      data: balances
    });
  } catch (error) {
    console.error('Error fetching student balances:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch student balances'
    });
  }
};

/**
 * Daily payments report
 */
const getDailyPayments = async (req, res) => {
  try {
    const { date } = req.query;
    const schoolId = req.user.school_id;

    const reportDate = date || new Date().toISOString().split('T')[0];

    const payments = await db('payments')
      .select(
        db.raw('DATE(payment_date) as payment_date'),
        db.raw('COUNT(*) as transaction_count'),
        db.raw('SUM(amount) as total_amount'),
        'payment_method',
        'currency'
      )
      .where('school_id', schoolId)
      .where('status', 'completed')
      .where('payment_date', '>=', reportDate)
      .where('payment_date', '<=', reportDate + ' 23:59:59')
      .groupBy(db.raw('DATE(payment_date)'), 'payment_method', 'currency')
      .orderBy('payment_date', 'desc');

    res.json({
      success: true,
      data: payments
    });
  } catch (error) {
    console.error('Error fetching daily payments:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch daily payments'
    });
  }
};

/**
 * Monthly revenue report
 */
const getMonthlyRevenue = async (req, res) => {
  try {
    const { year, month } = req.query;
    const schoolId = req.user.school_id;

    const currentYear = year || new Date().getFullYear();
    const currentMonth = month || new Date().getMonth() + 1;

    const revenue = await db('payments')
      .select(
        db.raw('EXTRACT(YEAR FROM payment_date) as year'),
        db.raw('EXTRACT(MONTH FROM payment_date) as month'),
        db.raw('COUNT(*) as transaction_count'),
        db.raw('SUM(amount) as total_amount'),
        'currency'
      )
      .where('school_id', schoolId)
      .where('status', 'completed')
      .whereRaw('EXTRACT(YEAR FROM payment_date) = ?', [currentYear])
      .whereRaw('EXTRACT(MONTH FROM payment_date) = ?', [currentMonth])
      .groupBy(db.raw('EXTRACT(YEAR FROM payment_date)'), db.raw('EXTRACT(MONTH FROM payment_date)'), 'currency')
      .orderBy('year', 'desc')
      .orderBy('month', 'desc');

    res.json({
      success: true,
      data: revenue
    });
  } catch (error) {
    console.error('Error fetching monthly revenue:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch monthly revenue'
    });
  }
};

/**
 * Outstanding fees report
 */
const getOutstandingFees = async (req, res) => {
  try {
    const { academic_year, fee_type } = req.query;
    const schoolId = req.user.school_id;

    let query = db('student_fee_assignments')
      .select(
        'student_fee_assignments.fee_type',
        'student_fee_assignments.academic_year',
        db.raw('COUNT(*) as student_count'),
        db.raw('SUM(final_amount) as total_amount'),
        db.raw('SUM(CASE WHEN status = \'pending\' THEN final_amount ELSE 0 END) as pending_amount'),
        db.raw('SUM(CASE WHEN status = \'partial\' THEN final_amount ELSE 0 END) as partial_amount'),
        db.raw('SUM(CASE WHEN status = \'paid\' THEN final_amount ELSE 0 END) as paid_amount'),
        'currency'
      )
      .where('school_id', schoolId)
      .whereNot('status', 'waived')
      .groupBy('fee_type', 'academic_year', 'currency');

    if (academic_year) {
      query = query.where('academic_year', academic_year);
    }

    if (fee_type) {
      query = query.where('fee_type', fee_type);
    }

    const outstanding = await query.orderBy('academic_year', 'desc');

    res.json({
      success: true,
      data: outstanding
    });
  } catch (error) {
    console.error('Error fetching outstanding fees:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch outstanding fees'
    });
  }
};

/**
 * Payment history report
 */
const getPaymentHistory = async (req, res) => {
  try {
    const { student_id, start_date, end_date, payment_method } = req.query;
    const schoolId = req.user.school_id;
    const userRole = req.user.role_name;

    let query = db('payments')
      .select(
        'payments.*',
        'student_users.first_name as student_first_name',
        'student_users.last_name as student_last_name',
        'students.student_id as student_number',
        'invoices.invoice_number',
        'users.first_name as received_by_first_name',
        'users.last_name as received_by_last_name'
      )
      .leftJoin('students', 'payments.student_id', 'students.id')
      .leftJoin('users as student_users', 'students.user_id', 'student_users.id')
      .leftJoin('invoices', 'payments.invoice_id', 'invoices.id')
      .leftJoin('users', 'payments.recorded_by', 'users.id')
      .where('payments.school_id', schoolId)
      .where('payments.status', 'completed');

    // Role-based filtering
    if (userRole === 'student') {
      query = query.where('students.user_id', req.user.id);
    } else if (userRole === 'parent') {
      const linkedStudentIds = await db('parent_student_relationships')
        .where('parent_id', req.user.id)
        .pluck('student_id');
      query = query.whereIn('payments.student_id', linkedStudentIds);
    }

    if (student_id) {
      query = query.where('payments.student_id', student_id);
    }

    if (start_date) {
      query = query.where('payment_date', '>=', start_date);
    }

    if (end_date) {
      query = query.where('payment_date', '<=', end_date);
    }

    if (payment_method) {
      query = query.where('payment_method', payment_method);
    }

    const payments = await query.orderBy('payments.payment_date', 'desc');

    res.json({
      success: true,
      data: payments
    });
  } catch (error) {
    console.error('Error fetching payment history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch payment history'
    });
  }
};

/**
 * Financial summary dashboard
 */
const getFinancialSummary = async (req, res) => {
  try {
    const { academic_year } = req.query;
    const schoolId = req.user.school_id;

    const currentAcademicYear = academic_year || '2024-2025';

    // Total billed
    const totalBilled = await db('invoices')
      .where('school_id', schoolId)
      .where('academic_year', currentAcademicYear)
      .sum('total_amount as total')
      .first();

    // Total collected
    const totalCollected = await db('payments')
      .where('school_id', schoolId)
      .where('status', 'completed')
      .whereRaw('EXTRACT(YEAR FROM payment_date) = ?', [parseInt(currentAcademicYear.split('-')[0])])
      .sum('amount as total')
      .first();

    // Outstanding balance
    const outstandingBalance = await db('invoices')
      .where('school_id', schoolId)
      .where('academic_year', currentAcademicYear)
      .whereNot('status', 'paid')
      .sum('total_amount as total')
      .first();

    // Payment count by method
    const paymentMethods = await db('payments')
      .select('payment_method', db.raw('COUNT(*) as count'), db.raw('SUM(amount) as total'))
      .where('school_id', schoolId)
      .where('status', 'completed')
      .whereRaw('EXTRACT(YEAR FROM payment_date) = ?', [parseInt(currentAcademicYear.split('-')[0])])
      .groupBy('payment_method');

    // Invoice status breakdown
    const invoiceStatus = await db('invoices')
      .select('status', db.raw('COUNT(*) as count'), db.raw('SUM(total_amount) as total'))
      .where('school_id', schoolId)
      .where('academic_year', currentAcademicYear)
      .groupBy('status');

    res.json({
      success: true,
      data: {
        academic_year: currentAcademicYear,
        total_billed: parseFloat(totalBilled.total) || 0,
        total_collected: parseFloat(totalCollected.total) || 0,
        outstanding_balance: parseFloat(outstandingBalance.total) || 0,
        collection_rate: totalBilled.total > 0 
          ? ((parseFloat(totalCollected.total) || 0) / parseFloat(totalBilled.total) * 100).toFixed(2)
          : 0,
        payment_methods: paymentMethods,
        invoice_status: invoiceStatus
      }
    });
  } catch (error) {
    console.error('Error fetching financial summary:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch financial summary'
    });
  }
};

module.exports = {
  getStudentBalances,
  getDailyPayments,
  getMonthlyRevenue,
  getOutstandingFees,
  getPaymentHistory,
  getFinancialSummary
};
