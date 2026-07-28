const db = require('../config/database');

/**
 * Get all invoices
 */
const getInvoices = async (req, res) => {
  try {
    const { student_id, status, academic_year } = req.query;
    const schoolId = req.user.school_id;
    const userRole = req.user.role_name;

    let query = db('invoices')
      .select(
        'invoices.*',
        'users.first_name as student_first_name',
        'users.last_name as student_last_name',
        'students.student_id as student_number'
      )
      .join('students', 'invoices.student_id', 'students.id')
      .leftJoin('users', 'students.user_id', 'users.id')
      .where('invoices.school_id', schoolId);

    // Role-based filtering
    if (userRole === 'student') {
      query = query.where('students.user_id', req.user.id);
    } else if (userRole === 'parent') {
      const linkedStudentIds = await db('parent_student_relationships')
        .where('parent_id', req.user.id)
        .pluck('student_id');
      query = query.whereIn('invoices.student_id', linkedStudentIds);
    }

    if (student_id) {
      query = query.where('invoices.student_id', student_id);
    }

    if (status) {
      query = query.where('invoices.status', status);
    }

    if (academic_year) {
      query = query.where('invoices.academic_year', academic_year);
    }

    const invoices = await query.orderBy('invoices.created_at', 'desc');

    res.json({
      success: true,
      data: invoices
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch invoices'
    });
  }
};

/**
 * Get invoice by ID with items
 */
const getInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const schoolId = req.user.school_id;
    const userRole = req.user.role_name;

    const invoice = await db('invoices')
      .select(
        'invoices.*',
        'users.first_name as student_first_name',
        'users.last_name as student_last_name',
        'students.student_id as student_number'
      )
      .join('students', 'invoices.student_id', 'students.id')
      .leftJoin('users', 'students.user_id', 'users.id')
      .where('invoices.id', id)
      .where('invoices.school_id', schoolId)
      .first();

    if (!invoice) {
      return res.status(404).json({
        success: false,
        error: 'Invoice not found'
      });
    }

    // Role-based access check
    if (userRole === 'student') {
      const student = await db('students').where('id', invoice.student_id).where('user_id', req.user.id).first();
      if (!student) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }
    } else if (userRole === 'parent') {
      const linkedStudentIds = await db('parent_student_relationships')
        .where('parent_id', req.user.id)
        .pluck('student_id');
      if (!linkedStudentIds.includes(invoice.student_id)) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }
    }

    // Get invoice items
    const items = await db('invoice_items')
      .where('invoice_id', id)
      .orderBy('created_at');

    // Get payments for this invoice
    const payments = await db('payments')
      .where('invoice_id', id)
      .orderBy('payment_date', 'desc');

    // Calculate paid amount
    const paidAmount = payments.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);
    const balanceDue = parseFloat(invoice.total_amount) - paidAmount;

    res.json({
      success: true,
      data: {
        ...invoice,
        items,
        payments,
        paid_amount: paidAmount,
        balance_due: balanceDue
      }
    });
  } catch (error) {
    console.error('Error fetching invoice:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch invoice'
    });
  }
};

/**
 * Create invoice
 */
const createInvoice = async (req, res) => {
  try {
    const { student_id, academic_year, fee_assignment_ids, due_date, notes } = req.body;
    const schoolId = req.user.school_id;

    // Get fee assignments
    const feeAssignments = await db('student_fee_assignments')
      .whereIn('id', fee_assignment_ids)
      .where('student_id', student_id)
      .where('school_id', schoolId);

    if (feeAssignments.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid fee assignments found'
      });
    }

    // Calculate totals
    const subtotal = feeAssignments.reduce((sum, fa) => sum + parseFloat(fa.final_amount), 0);
    const discountAmount = feeAssignments.reduce((sum, fa) => {
      return sum + (parseFloat(fa.amount) - parseFloat(fa.final_amount));
    }, 0);
    const totalAmount = subtotal;

    // Generate invoice number
    const invoiceCount = await db('invoices').where('school_id', schoolId).count('id as count').first();
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(parseInt(invoiceCount.count) + 1).padStart(6, '0')}`;

    // Create invoice
    const [invoice] = await db('invoices')
      .insert({
        school_id: schoolId,
        student_id,
        academic_year,
        invoice_number: invoiceNumber,
        subtotal,
        discount_amount: discountAmount,
        total_amount: totalAmount,
        currency: 'LRD',
        due_date,
        status: 'pending',
        notes
      })
      .returning('*');

    // Create invoice items
    for (const feeAssignment of feeAssignments) {
      await db('invoice_items').insert({
        invoice_id: invoice.id,
        fee_assignment_id: feeAssignment.id,
        description: `${feeAssignment.fee_type} - ${feeAssignment.academic_year}`,
        quantity: 1,
        unit_price: feeAssignment.final_amount,
        amount: feeAssignment.final_amount
      });
    }

    // Update fee assignment status
    await db('student_fee_assignments')
      .whereIn('id', fee_assignment_ids)
      .update({ status: 'billed' });

    res.status(201).json({
      success: true,
      data: invoice
    });
  } catch (error) {
    console.error('Error creating invoice:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create invoice'
    });
  }
};

/**
 * Update invoice
 */
const updateInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes, status } = req.body;
    const schoolId = req.user.school_id;

    const [invoice] = await db('invoices')
      .where('id', id)
      .where('school_id', schoolId)
      .update({
        notes,
        status: status || db.raw('status')
      })
      .returning('*');

    if (!invoice) {
      return res.status(404).json({
        success: false,
        error: 'Invoice not found'
      });
    }

    res.json({
      success: true,
      data: invoice
    });
  } catch (error) {
    console.error('Error updating invoice:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update invoice'
    });
  }
};

/**
 * Delete invoice
 */
const deleteInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const schoolId = req.user.school_id;

    const deleted = await db('invoices')
      .where('id', id)
      .where('school_id', schoolId)
      .del();

    if (deleted === 0) {
      return res.status(404).json({
        success: false,
        error: 'Invoice not found'
      });
    }

    res.json({
      success: true,
      message: 'Invoice deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete invoice'
    });
  }
};

/**
 * Get overdue invoices
 */
const getOverdueInvoices = async (req, res) => {
  try {
    const schoolId = req.user.school_id;
    const currentDate = new Date().toISOString().split('T')[0];

    const overdueInvoices = await db('invoices')
      .select(
        'invoices.*',
        'users.first_name as student_first_name',
        'users.last_name as student_last_name',
        'students.student_id as student_number'
      )
      .join('students', 'invoices.student_id', 'students.id')
      .leftJoin('users', 'students.user_id', 'users.id')
      .where('invoices.school_id', schoolId)
      .where('invoices.due_date', '<', currentDate)
      .where('invoices.status', '!=', 'paid')
      .orderBy('invoices.due_date', 'asc');

    res.json({
      success: true,
      data: overdueInvoices
    });
  } catch (error) {
    console.error('Error fetching overdue invoices:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch overdue invoices'
    });
  }
};

/**
 * Update invoice status based on payments
 */
const updateInvoiceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const schoolId = req.user.school_id;

    const invoice = await db('invoices')
      .where('id', id)
      .where('school_id', schoolId)
      .first();

    if (!invoice) {
      return res.status(404).json({
        success: false,
        error: 'Invoice not found'
      });
    }

    // Calculate paid amount
    const payments = await db('payments')
      .where('invoice_id', id)
      .where('status', 'completed');
    
    const paidAmount = payments.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);
    const balanceDue = parseFloat(invoice.total_amount) - paidAmount;

    let newStatus = invoice.status;
    if (balanceDue <= 0) {
      newStatus = 'paid';
    } else if (paidAmount > 0) {
      newStatus = 'partial';
    }

    const [updatedInvoice] = await db('invoices')
      .where('id', id)
      .update({ status: newStatus })
      .returning('*');

    res.json({
      success: true,
      data: {
        ...updatedInvoice,
        paid_amount: paidAmount,
        balance_due: balanceDue
      }
    });
  } catch (error) {
    console.error('Error updating invoice status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update invoice status'
    });
  }
};

module.exports = {
  getInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  getOverdueInvoices,
  updateInvoiceStatus
};
