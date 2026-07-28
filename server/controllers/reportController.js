const db = require('../config/database');

/**
 * Generate student academic report card
 */
const getStudentAcademicReport = async (req, res) => {
  try {
    const { student_id } = req.params;
    const schoolId = req.user.school_id;
    const userRole = req.user.role;

    // Check permissions
    let targetStudentId = student_id;
    if (userRole === 'student') {
      const studentRecord = await db('students')
        .where('user_id', req.user.id)
        .where('school_id', schoolId)
        .first();
      
      if (!studentRecord) {
        return res.status(404).json({ success: false, error: 'Student record not found' });
      }
      
      targetStudentId = studentRecord.id;
      
      if (student_id && student_id !== targetStudentId) {
        return res.status(403).json({ success: false, error: 'Access denied' });
      }
    }

    // Get student information
    const student = await db('students')
      .join('users', 'students.user_id', 'users.id')
      .join('classes', 'students.class_id', 'classes.id')
      .join('grades', 'classes.grade_id', 'grades.id')
      .where('students.id', targetStudentId)
      .where('students.school_id', schoolId)
      .select(
        'students.*',
        'users.first_name',
        'users.last_name',
        'users.email',
        'classes.name as class_name',
        'grades.name as grade_name'
      )
      .first();

    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }

    // Get grades by subject
    const grades = await db('student_grades')
      .join('subjects', 'student_grades.subject_id', 'subjects.id')
      .where('student_grades.student_id', targetStudentId)
      .where('student_grades.school_id', schoolId)
      .select('subjects.name as subject', 'student_grades.grade', 'student_grades.updated_at')
      .orderBy('subjects.name');

    // Calculate average
    const gradeValues = grades.map(g => parseFloat(g.grade)).filter(g => !isNaN(g));
    const averageGrade = gradeValues.length > 0
      ? (gradeValues.reduce((sum, g) => sum + g, 0) / gradeValues.length).toFixed(2)
      : 0;

    res.json({
      success: true,
      data: {
        student,
        grades,
        averageGrade: parseFloat(averageGrade),
        totalSubjects: grades.length
      }
    });
  } catch (error) {
    console.error('Error generating academic report:', error);
    res.status(500).json({ success: false, error: 'Failed to generate academic report' });
  }
};

/**
 * Generate student attendance report
 */
const getStudentAttendanceReport = async (req, res) => {
  try {
    const { student_id } = req.params;
    const { start_date, end_date } = req.query;
    const schoolId = req.user.school_id;
    const userRole = req.user.role;

    // Check permissions
    let targetStudentId = student_id;
    if (userRole === 'student') {
      const studentRecord = await db('students')
        .where('user_id', req.user.id)
        .where('school_id', schoolId)
        .first();
      
      if (!studentRecord) {
        return res.status(404).json({ success: false, error: 'Student record not found' });
      }
      
      targetStudentId = studentRecord.id;
      
      if (student_id && student_id !== targetStudentId) {
        return res.status(403).json({ success: false, error: 'Access denied' });
      }
    }

    // Get student information
    const student = await db('students')
      .join('users', 'students.user_id', 'users.id')
      .join('classes', 'students.class_id', 'classes.id')
      .where('students.id', targetStudentId)
      .where('students.school_id', schoolId)
      .select(
        'students.*',
        'users.first_name',
        'users.last_name',
        'classes.name as class_name'
      )
      .first();

    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }

    // Get attendance data
    let query = db('attendance')
      .where('student_id', targetStudentId)
      .where('school_id', schoolId);

    if (start_date) {
      query = query.where('date', '>=', start_date);
    }
    if (end_date) {
      query = query.where('date', '<=', end_date);
    }

    const attendance = await query.orderBy('date');

    // Calculate statistics
    const stats = await db('attendance')
      .select(
        db.raw('COUNT(*) FILTER (WHERE status = \'present\') as present'),
        db.raw('COUNT(*) FILTER (WHERE status = \'absent\') as absent'),
        db.raw('COUNT(*) FILTER (WHERE status = \'late\') as late'),
        db.raw('COUNT(*) FILTER (WHERE status = \'excused\') as excused'),
        db.raw('COUNT(*) as total')
      )
      .where('student_id', targetStudentId)
      .where('school_id', schoolId)
      .first();

    const attendanceRate = stats.total > 0
      ? ((parseInt(stats.present) / parseInt(stats.total)) * 100).toFixed(2)
      : 0;

    res.json({
      success: true,
      data: {
        student,
        attendance,
        statistics: {
          ...stats,
          attendanceRate: parseFloat(attendanceRate)
        }
      }
    });
  } catch (error) {
    console.error('Error generating attendance report:', error);
    res.status(500).json({ success: false, error: 'Failed to generate attendance report' });
  }
};

/**
 * Generate student fee statement
 */
const getStudentFeeStatement = async (req, res) => {
  try {
    const { student_id } = req.params;
    const schoolId = req.user.school_id;
    const userRole = req.user.role;

    // Check permissions
    let targetStudentId = student_id;
    if (userRole === 'student') {
      const studentRecord = await db('students')
        .where('user_id', req.user.id)
        .where('school_id', schoolId)
        .first();
      
      if (!studentRecord) {
        return res.status(404).json({ success: false, error: 'Student record not found' });
      }
      
      targetStudentId = studentRecord.id;
      
      if (student_id && student_id !== targetStudentId) {
        return res.status(403).json({ success: false, error: 'Access denied' });
      }
    }

    // Get student information
    const student = await db('students')
      .join('users', 'students.user_id', 'users.id')
      .join('classes', 'students.class_id', 'classes.id')
      .where('students.id', targetStudentId)
      .where('students.school_id', schoolId)
      .select(
        'students.*',
        'users.first_name',
        'users.last_name',
        'users.email',
        'classes.name as class_name'
      )
      .first();

    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }

    // Get invoices
    const invoices = await db('invoices')
      .where('student_id', targetStudentId)
      .where('school_id', schoolId)
      .orderBy('due_date');

    // Get payments
    const payments = await db('payments')
      .where('student_id', targetStudentId)
      .where('school_id', schoolId)
      .orderBy('payment_date');

    // Calculate totals
    const totalBilled = invoices.reduce((sum, inv) => sum + parseFloat(inv.amount), 0);
    const totalPaid = payments.reduce((sum, pay) => sum + parseFloat(pay.amount), 0);
    const outstandingBalance = totalBilled - totalPaid;

    res.json({
      success: true,
      data: {
        student,
        invoices,
        payments,
        summary: {
          totalBilled,
          totalPaid,
          outstandingBalance
        }
      }
    });
  } catch (error) {
    console.error('Error generating fee statement:', error);
    res.status(500).json({ success: false, error: 'Failed to generate fee statement' });
  }
};

/**
 * Generate class performance report (for teachers)
 */
const getClassPerformanceReport = async (req, res) => {
  try {
    const { class_id } = req.params;
    const schoolId = req.user.school_id;
    const userId = req.user.id;

    // Get teacher record
    const teacher = await db('teachers')
      .where('user_id', userId)
      .where('school_id', schoolId)
      .first();

    if (!teacher) {
      return res.status(403).json({ success: false, error: 'Teacher record not found' });
    }

    // Get class information
    const classInfo = await db('classes')
      .join('grades', 'classes.grade_id', 'grades.id')
      .where('classes.id', class_id)
      .where('classes.school_id', schoolId)
      .where('classes.teacher_id', teacher.id)
      .select('classes.*', 'grades.name as grade_name')
      .first();

    if (!classInfo) {
      return res.status(404).json({ success: false, error: 'Class not found or not assigned to you' });
    }

    // Get students in class
    const students = await db('students')
      .join('users', 'students.user_id', 'users.id')
      .where('students.class_id', class_id)
      .where('students.school_id', schoolId)
      .select('students.*', 'users.first_name', 'users.last_name')
      .orderBy('users.last_name', 'users.first_name');

    // Get grades for all students in class
    const grades = await db('student_grades')
      .join('students', 'student_grades.student_id', 'students.id')
      .join('users', 'students.user_id', 'users.id')
      .join('subjects', 'student_grades.subject_id', 'subjects.id')
      .where('students.class_id', class_id)
      .where('student_grades.school_id', schoolId)
      .select(
        'student_grades.*',
        'users.first_name',
        'users.last_name',
        'subjects.name as subject'
      )
      .orderBy('users.last_name', 'users.first_name', 'subjects.name');

    // Calculate class statistics
    const gradeValues = grades.map(g => parseFloat(g.grade)).filter(g => !isNaN(g));
    const classAverage = gradeValues.length > 0
      ? (gradeValues.reduce((sum, g) => sum + g, 0) / gradeValues.length).toFixed(2)
      : 0;

    // Calculate per-student averages
    const studentAverages = {};
    grades.forEach(grade => {
      if (!studentAverages[grade.student_id]) {
        studentAverages[grade.student_id] = { sum: 0, count: 0 };
      }
      studentAverages[grade.student_id].sum += parseFloat(grade.grade);
      studentAverages[grade.student_id].count += 1;
    });

    const studentStats = students.map(student => {
      const avg = studentAverages[student.id]
        ? (studentAverages[student.id].sum / studentAverages[student.id].count).toFixed(2)
        : 0;
      return {
        ...student,
        averageGrade: parseFloat(avg)
      };
    });

    res.json({
      success: true,
      data: {
        class: classInfo,
        students: studentStats,
        grades,
        classAverage: parseFloat(classAverage),
        totalStudents: students.length,
        totalGrades: grades.length
      }
    });
  } catch (error) {
    console.error('Error generating class performance report:', error);
    res.status(500).json({ success: false, error: 'Failed to generate class performance report' });
  }
};

/**
 * Generate student enrollment report (for admins)
 */
const getEnrollmentReport = async (req, res) => {
  try {
    const { grade_id, start_date, end_date } = req.query;
    const schoolId = req.user.school_id;

    let query = db('students')
      .join('users', 'students.user_id', 'users.id')
      .join('classes', 'students.class_id', 'classes.id')
      .join('grades', 'classes.grade_id', 'grades.id')
      .where('students.school_id', schoolId)
      .select(
        'students.*',
        'users.first_name',
        'users.last_name',
        'users.email',
        'classes.name as class_name',
        'grades.name as grade_name'
      );

    if (grade_id) {
      query = query.where('classes.grade_id', grade_id);
    }

    if (start_date) {
      query = query.where('students.enrollment_date', '>=', start_date);
    }

    if (end_date) {
      query = query.where('students.enrollment_date', '<=', end_date);
    }

    const students = await query.orderBy('grades.name', 'classes.name', 'users.last_name', 'users.first_name');

    // Calculate statistics by grade
    const gradeStats = await db('students')
      .join('classes', 'students.class_id', 'classes.id')
      .join('grades', 'classes.grade_id', 'grades.id')
      .where('students.school_id', schoolId)
      .select(
        'grades.name as grade_name',
        db.raw('COUNT(*) as count')
      )
      .groupBy('grades.name')
      .orderBy('grades.name');

    res.json({
      success: true,
      data: {
        students,
        statistics: {
          totalStudents: students.length,
          byGrade: gradeStats
        }
      }
    });
  } catch (error) {
    console.error('Error generating enrollment report:', error);
    res.status(500).json({ success: false, error: 'Failed to generate enrollment report' });
  }
};

/**
 * Generate financial report (for admins)
 */
const getFinancialReport = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    const schoolId = req.user.school_id;

    // Get payments
    let paymentsQuery = db('payments')
      .join('students', 'payments.student_id', 'students.id')
      .join('users', 'students.user_id', 'users.id')
      .where('payments.school_id', schoolId)
      .where('payments.status', 'completed')
      .select('payments.*', 'users.first_name', 'users.last_name');

    if (start_date) {
      paymentsQuery = paymentsQuery.where('payments.payment_date', '>=', start_date);
    }
    if (end_date) {
      paymentsQuery = paymentsQuery.where('payments.payment_date', '<=', end_date);
    }

    const payments = await paymentsQuery.orderBy('payments.payment_date', 'desc');

    // Get invoices
    let invoicesQuery = db('invoices')
      .join('students', 'invoices.student_id', 'students.id')
      .join('users', 'students.user_id', 'users.id')
      .where('invoices.school_id', schoolId)
      .select('invoices.*', 'users.first_name', 'users.last_name');

    if (start_date) {
      invoicesQuery = invoicesQuery.where('invoices.due_date', '>=', start_date);
    }
    if (end_date) {
      invoicesQuery = invoicesQuery.where('invoices.due_date', '<=', end_date);
    }

    const invoices = await invoicesQuery.orderBy('invoices.due_date', 'desc');

    // Calculate totals
    const totalRevenue = payments.reduce((sum, pay) => sum + parseFloat(pay.amount), 0);
    const totalBilled = invoices.reduce((sum, inv) => sum + parseFloat(inv.amount), 0);
    const outstandingBalance = invoices
      .filter(inv => inv.status === 'pending')
      .reduce((sum, inv) => sum + parseFloat(inv.amount), 0);

    // Monthly breakdown
    const monthlyStats = await db('payments')
      .select(
        db.raw('TO_CHAR(payment_date, \'YYYY-MM\') as month'),
        db.raw('SUM(amount) as total')
      )
      .where('school_id', schoolId)
      .where('status', 'completed')
      .where('payment_date', '>=', db.raw("NOW() - INTERVAL '12 months'"))
      .groupBy(db.raw('TO_CHAR(payment_date, \'YYYY-MM\')'))
      .orderBy(db.raw('month'));

    res.json({
      success: true,
      data: {
        payments,
        invoices,
        summary: {
          totalRevenue,
          totalBilled,
          outstandingBalance,
          totalPayments: payments.length,
          totalInvoices: invoices.length
        },
        monthlyStats
      }
    });
  } catch (error) {
    console.error('Error generating financial report:', error);
    res.status(500).json({ success: false, error: 'Failed to generate financial report' });
  }
};

/**
 * Generate attendance report (for admins)
 */
const getAttendanceReport = async (req, res) => {
  try {
    const { class_id, start_date, end_date } = req.query;
    const schoolId = req.user.school_id;

    let query = db('attendance')
      .join('students', 'attendance.student_id', 'students.id')
      .join('users', 'students.user_id', 'users.id')
      .join('classes', 'attendance.class_id', 'classes.id')
      .join('grades', 'classes.grade_id', 'grades.id')
      .where('attendance.school_id', schoolId)
      .select(
        'attendance.*',
        'users.first_name',
        'users.last_name',
        'classes.name as class_name',
        'grades.name as grade_name'
      );

    if (class_id) {
      query = query.where('attendance.class_id', class_id);
    }

    if (start_date) {
      query = query.where('attendance.date', '>=', start_date);
    }

    if (end_date) {
      query = query.where('attendance.date', '<=', end_date);
    }

    const attendance = await query.orderBy('attendance.date', 'desc');

    // Calculate statistics
    const stats = await db('attendance')
      .select(
        db.raw('COUNT(*) FILTER (WHERE status = \'present\') as present'),
        db.raw('COUNT(*) FILTER (WHERE status = \'absent\') as absent'),
        db.raw('COUNT(*) FILTER (WHERE status = \'late\') as late'),
        db.raw('COUNT(*) FILTER (WHERE status = \'excused\') as excused'),
        db.raw('COUNT(*) as total')
      )
      .where('school_id', schoolId);

    if (class_id) {
      stats.where('class_id', class_id);
    }

    if (start_date) {
      stats.where('date', '>=', start_date);
    }

    if (end_date) {
      stats.where('date', '<=', end_date);
    }

    const statistics = await stats.first();

    const attendanceRate = statistics.total > 0
      ? ((parseInt(statistics.present) / parseInt(statistics.total)) * 100).toFixed(2)
      : 0;

    res.json({
      success: true,
      data: {
        attendance,
        statistics: {
          ...statistics,
          attendanceRate: parseFloat(attendanceRate)
        }
      }
    });
  } catch (error) {
    console.error('Error generating attendance report:', error);
    res.status(500).json({ success: false, error: 'Failed to generate attendance report' });
  }
};

module.exports = {
  getStudentAcademicReport,
  getStudentAttendanceReport,
  getStudentFeeStatement,
  getClassPerformanceReport,
  getEnrollmentReport,
  getFinancialReport,
  getAttendanceReport
};
