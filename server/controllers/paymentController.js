const db = require('../config/database');

/**
 * Get all payments
 */
const getPayments = async (req, res) => {
  try {
    const { student_id, invoice_id, payment_method, start_date, end_date } = req.query;
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
      .where('payments.school_id', schoolId);

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

    if (invoice_id) {
      query = query.where('payments.invoice_id', invoice_id);
    }

    if (payment_method) {
      query = query.where('payment_method', payment_method);
    }

    if (start_date) {
      query = query.where('payment_date', '>=', start_date);
    }

    if (end_date) {
      query = query.where('payment_date', '<=', end_date);
    }

    const payments = await query.orderBy('payments.payment_date', 'desc');

    res.json({
      success: true,
      data: payments
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch payments'
    });
  }
};

/**
 * Get payment by ID
 */
const getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;
    const schoolId = req.user.school_id;

    const payment = await db('payments')
      .select(
        'payments.*',
        'student_users.first_name as student_first_name',
        'student_users.last_name as student_last_name',
        'students.student_id as student_number',
        'invoices.invoice_number',
        'invoices.total_amount as invoice_total_amount',
        'users.first_name as received_by_first_name',
        'users.last_name as received_by_last_name'
      )
      .leftJoin('students', 'payments.student_id', 'students.id')
      .leftJoin('users as student_users', 'students.user_id', 'student_users.id')
      .leftJoin('invoices', 'payments.invoice_id', 'invoices.id')
      .leftJoin('users', 'payments.recorded_by', 'users.id')
      .where('payments.id', id)
      .where('payments.school_id', schoolId)
      .first();

    if (!payment) {
      return res.status(404).json({
        success: false,
        error: 'Payment not found'
      });
    }

    res.json({
      success: true,
      data: payment
    });
  } catch (error) {
    console.error('Error fetching payment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch payment'
    });
  }
};

/**
 * Create payment
 */
const createPayment = async (req, res) => {
  try {
    const { invoice_id, student_id, amount_paid, payment_method, transaction_reference, notes } = req.body;
    const schoolId = req.user.school_id;
    const receivedBy = req.user.id;

    // Verify invoice exists and belongs to school
    const invoice = await db('invoices')
      .where('id', invoice_id)
      .where('school_id', schoolId)
      .first();

    if (!invoice) {
      return res.status(404).json({
        success: false,
        error: 'Invoice not found'
      });
    }

    // Calculate current paid amount
    const existingPayments = await db('payments')
      .where('invoice_id', invoice_id)
      .where('status', 'completed');
    
    const totalPaid = existingPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
    const newTotalPaid = totalPaid + parseFloat(amount_paid);
    const invoiceTotal = parseFloat(invoice.total_amount);

    // Check if payment exceeds invoice amount
    if (newTotalPaid > invoiceTotal) {
      return res.status(400).json({
        success: false,
        error: `Payment exceeds invoice amount. Outstanding balance: ${invoiceTotal - totalPaid}`
      });
    }

    // Create payment
    const [payment] = await db('payments')
      .insert({
        school_id: schoolId,
        invoice_id,
        student_id: invoice.student_id,
        amount: amount_paid,
        currency: invoice.currency,
        payment_method,
        payment_reference: transaction_reference,
        payment_date: new Date(),
        status: 'completed',
        recorded_by: receivedBy,
        remarks: notes
      })
      .returning('*');

    // Update invoice status
    let invoiceStatus = invoice.status;
    if (newTotalPaid >= invoiceTotal) {
      invoiceStatus = 'paid';
    } else if (newTotalPaid > 0) {
      invoiceStatus = 'partial';
    }

    await db('invoices')
      .where('id', invoice_id)
      .update({ status: invoiceStatus });

    // Update fee assignment status if applicable
    const invoiceItems = await db('invoice_items').where('invoice_id', invoice_id);
    for (const item of invoiceItems) {
      if (item.fee_assignment_id) {
        await db('student_fee_assignments')
          .where('id', item.fee_assignment_id)
          .update({ status: invoiceStatus });
      }
    }

    res.status(201).json({
      success: true,
      data: payment
    });
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create payment'
    });
  }
};

/**
 * Update payment
 */
const updatePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes, status } = req.body;
    const schoolId = req.user.school_id;

    const [payment] = await db('payments')
      .where('id', id)
      .where('school_id', schoolId)
      .update({
        notes,
        status: status || db.raw('status')
      })
      .returning('*');

    if (!payment) {
      return res.status(404).json({
        success: false,
        error: 'Payment not found'
      });
    }

    res.json({
      success: true,
      data: payment
    });
  } catch (error) {
    console.error('Error updating payment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update payment'
    });
  }
};

/**
 * Process refund
 */
const processRefund = async (req, res) => {
  try {
    const { id } = req.params;
    const { refund_amount, notes } = req.body;
    const schoolId = req.user.school_id;

    const payment = await db('payments')
      .where('id', id)
      .where('school_id', schoolId)
      .first();

    if (!payment) {
      return res.status(404).json({
        success: false,
        error: 'Payment not found'
      });
    }

    if (parseFloat(refund_amount) > parseFloat(payment.amount)) {
      return res.status(400).json({
        success: false,
        error: 'Refund amount exceeds payment amount'
      });
    }

    // Update payment status to refunded
    await db('payments')
      .where('id', id)
      .update({
        status: 'refunded',
        notes: `Refunded: ${refund_amount}. ${notes || ''}`
      });

    // Update invoice status if needed
    if (payment.invoice_id) {
      const remainingPayments = await db('payments')
        .where('invoice_id', payment.invoice_id)
        .where('status', 'completed');
      
      const totalRemaining = remainingPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
      const invoice = await db('invoices').where('id', payment.invoice_id).first();
      
      let invoiceStatus = 'pending';
      if (totalRemaining > 0) {
        invoiceStatus = 'partial';
      }
      if (totalRemaining >= parseFloat(invoice.total_amount)) {
        invoiceStatus = 'paid';
      }

      await db('invoices')
        .where('id', payment.invoice_id)
        .update({ status: invoiceStatus });
    }

    res.json({
      success: true,
      message: 'Refund processed successfully'
    });
  } catch (error) {
    console.error('Error processing refund:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process refund'
    });
  }
};

module.exports = {
  getPayments,
  getPaymentById,
  createPayment,
  updatePayment,
  processRefund
};
