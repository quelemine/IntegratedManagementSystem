const express = require('express');
const router = express.Router();
const { sendEmail, sendBulkEmails, verifyEmailConfig } = require('../services/emailService');
const db = require('../config/database');
const { authenticate } = require('../middleware/auth');

// Verify email configuration
router.get('/verify', authenticate, async (req, res) => {
  try {
    const result = await verifyEmailConfig();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get email recipients (students filtered by criteria)
router.get('/recipients', authenticate, async (req, res) => {
  try {
    // Check if user has permission
    if (req.user.role !== 'super_admin' && req.user.role !== 'admin' && req.user.role !== 'principal') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const { grade_id, class_id, division_id, academic_year } = req.query;
    
    let query = db('students')
      .select(
        'students.id',
        'students.student_id as student_number',
        'users.first_name',
        'users.last_name',
        'users.email',
        'students.grade_id',
        'students.class_id',
        'students.division_id',
        'grades.name as grade_name',
        'classes.name as class_name',
        'divisions.name as division_name'
      )
      .join('users', 'students.user_id', 'users.id')
      .leftJoin('grades', 'students.grade_id', 'grades.id')
      .leftJoin('classes', 'students.class_id', 'classes.id')
      .leftJoin('divisions', 'students.division_id', 'divisions.id')
      .whereNotNull('users.email')
      .where('users.email', '!=', '');

    if (grade_id) {
      query = query.where('students.grade_id', grade_id);
    }
    if (class_id) {
      query = query.where('students.class_id', class_id);
    }
    if (division_id) {
      query = query.where('students.division_id', division_id);
    }

    const recipients = await query;
    
    const formattedRecipients = recipients.map(r => ({
      id: r.id,
      student_number: r.student_number,
      name: `${r.first_name} ${r.last_name}`,
      email: r.email,
      grade_name: r.grade_name,
      class_name: r.class_name,
      division_name: r.division_name,
      academic_year: r.academic_year
    }));

    res.json(formattedRecipients);
  } catch (error) {
    console.error('Error fetching recipients:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Send email to recipients
router.post('/send', authenticate, async (req, res) => {
  try {
    // Check if user has permission
    if (req.user.role !== 'super_admin' && req.user.role !== 'admin' && req.user.role !== 'principal') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const { recipients, subject, message, isHtml = false } = req.body;
    const sender = req.user;

    if (!recipients || recipients.length === 0) {
      return res.status(400).json({ success: false, message: 'No recipients specified' });
    }

    if (!subject || !message) {
      return res.status(400).json({ success: false, message: 'Subject and message are required' });
    }

    // Prepare email content
    const text = message;
    const html = isHtml ? message : `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1e40af; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>SIM Technology Institute</h2>
          </div>
          <div class="content">
            <p>Dear {{name}},</p>
            <p>${message.replace(/\n/g, '<br>')}</p>
          </div>
          <div class="footer">
            <p>This email was sent by ${sender.first_name} ${sender.last_name} (${sender.email})</p>
            <p>&copy; ${new Date().getFullYear()} SIM Technology Institute. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send bulk emails
    const results = await sendBulkEmails(recipients, subject, text, html);

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    res.json({
      success: true,
      message: `Email sent to ${successful} recipients${failed > 0 ? `, ${failed} failed` : ''}`,
      results
    });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get email statistics
router.get('/stats', authenticate, async (req, res) => {
  try {
    // Check if user has permission
    if (req.user.role !== 'super_admin' && req.user.role !== 'admin' && req.user.role !== 'principal') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const totalStudents = await db('students')
      .join('users', 'students.user_id', 'users.id')
      .whereNotNull('users.email')
      .where('users.email', '!=', '')
      .count('* as count')
      .first();

    const byGrade = await db('students')
      .select('grades.name as grade_name')
      .count('students.id as count')
      .join('users', 'students.user_id', 'users.id')
      .leftJoin('grades', 'students.grade_id', 'grades.id')
      .whereNotNull('users.email')
      .where('users.email', '!=', '')
      .groupBy('grades.id', 'grades.name')
      .orderBy('grades.name');

    const byClass = await db('students')
      .select('classes.name as class_name')
      .count('students.id as count')
      .join('users', 'students.user_id', 'users.id')
      .leftJoin('classes', 'students.class_id', 'classes.id')
      .whereNotNull('users.email')
      .where('users.email', '!=', '')
      .groupBy('classes.id', 'classes.name')
      .orderBy('classes.name');

    res.json({
      total_students: totalStudents.count,
      by_grade: byGrade,
      by_class: byClass
    });
  } catch (error) {
    console.error('Error fetching email stats:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
