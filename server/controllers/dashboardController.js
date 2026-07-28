const db = require('../config/database');

/**
 * Get admin dashboard analytics
 * Includes: total students, teachers, parents, revenue, outstanding balances, attendance statistics
 */
const getAdminAnalytics = async (req, res) => {
  try {
    console.log('[DASHBOARD] Admin analytics request');
    console.log('[DASHBOARD] User ID:', req.user?.id);
    console.log('[DASHBOARD] User role_id:', req.user?.role_id);
    console.log('[DASHBOARD] School ID:', req.user?.school_id);

    const schoolId = req.user.school_id;

    if (!schoolId) {
      console.error('[DASHBOARD] Missing school_id for user:', req.user?.id);
      return res.status(400).json({ success: false, error: 'School ID is required' });
    }

    // Get total students
    let totalStudents;
    try {
      console.log('[DASHBOARD] Querying total students');
      totalStudents = await db('students')
        .where('school_id', schoolId)
        .count('* as count')
        .first();
      console.log('[DASHBOARD] Total students query completed:', totalStudents?.count);
    } catch (error) {
      console.error('[DASHBOARD] Error querying students:', error.message);
      totalStudents = { count: 0 };
    }

    // Get total teachers
    let totalTeachers;
    try {
      console.log('[DASHBOARD] Querying total teachers');
      totalTeachers = await db('teachers')
        .join('users', 'teachers.user_id', 'users.id')
        .where('teachers.school_id', schoolId)
        .where('users.is_active', true)
        .count('* as count')
        .first();
      console.log('[DASHBOARD] Total teachers query completed:', totalTeachers?.count);
    } catch (error) {
      console.error('[DASHBOARD] Error querying teachers:', error.message);
      totalTeachers = { count: 0 };
    }

    // Get total parents
    let totalParents;
    try {
      console.log('[DASHBOARD] Querying total parents');
      totalParents = await db('parents')
        .join('users', 'parents.user_id', 'users.id')
        .where('parents.school_id', schoolId)
        .where('users.is_active', true)
        .count('* as count')
        .first();
      console.log('[DASHBOARD] Total parents query completed:', totalParents?.count);
    } catch (error) {
      console.error('[DASHBOARD] Error querying parents:', error.message);
      totalParents = { count: 0 };
    }

    // Get total revenue (sum of payments)
    let totalRevenue;
    try {
      console.log('[DASHBOARD] Querying total revenue');
      totalRevenue = await db('payments')
        .where('school_id', schoolId)
        .where('status', 'completed')
        .sum('amount as total')
        .first();
      console.log('[DASHBOARD] Total revenue query completed:', totalRevenue?.total);
    } catch (error) {
      console.error('[DASHBOARD] Error querying revenue:', error.message);
      totalRevenue = { total: 0 };
    }

    // Get outstanding balances (sum of unpaid invoices)
    let outstandingBalances;
    try {
      console.log('[DASHBOARD] Querying outstanding balances');
      outstandingBalances = await db('invoices')
        .where('school_id', schoolId)
        .where('status', 'pending')
        .sum('amount as total')
        .first();
      console.log('[DASHBOARD] Outstanding balances query completed:', outstandingBalances?.total);
    } catch (error) {
      console.error('[DASHBOARD] Error querying invoices:', error.message);
      outstandingBalances = { total: 0 };
    }

    // Get attendance statistics (last 30 days)
    let attendanceStats;
    try {
      console.log('[DASHBOARD] Querying attendance statistics');
      attendanceStats = await db('attendance')
        .join('students', 'attendance.student_id', 'students.id')
        .where('students.school_id', schoolId)
        .where('attendance.date', '>=', db.raw("NOW() - INTERVAL '30 days'"))
        .select(
          db.raw('COUNT(*) FILTER (WHERE status = "present") as present'),
          db.raw('COUNT(*) FILTER (WHERE status = "absent") as absent'),
          db.raw('COUNT(*) FILTER (WHERE status = "late") as late'),
          db.raw('COUNT(*) as total')
        )
        .first();
      console.log('[DASHBOARD] Attendance stats query completed');
    } catch (error) {
      console.error('[DASHBOARD] Error querying attendance:', error.message);
      attendanceStats = { present: 0, absent: 0, late: 0, total: 0 };
    }

    // Get recent activity (last 10 audit logs)
    let recentActivity;
    try {
      console.log('[DASHBOARD] Querying recent activity');
      recentActivity = await db('audit_logs')
        .join('users', 'audit_logs.user_id', 'users.id')
        .where('audit_logs.school_id', schoolId)
        .select('audit_logs.*', 'users.first_name', 'users.last_name')
        .orderBy('audit_logs.timestamp', 'desc')
        .limit(10);
      console.log('[DASHBOARD] Recent activity query completed:', recentActivity?.length);
    } catch (error) {
      console.error('[DASHBOARD] Error querying audit logs:', error.message);
      recentActivity = [];
    }

    const attendanceRate = attendanceStats && attendanceStats.total > 0 
      ? ((parseInt(attendanceStats.present || 0) / parseInt(attendanceStats.total)) * 100).toFixed(1)
      : 0;

    res.json({
      success: true,
      data: {
        totalStudents: parseInt(totalStudents?.count) || 0,
        totalTeachers: parseInt(totalTeachers?.count) || 0,
        totalParents: parseInt(totalParents?.count) || 0,
        totalRevenue: parseFloat(totalRevenue?.total) || 0,
        outstandingBalances: parseFloat(outstandingBalances?.total) || 0,
        attendanceStats: {
          present: parseInt(attendanceStats?.present) || 0,
          absent: parseInt(attendanceStats?.absent) || 0,
          late: parseInt(attendanceStats?.late) || 0,
          total: parseInt(attendanceStats?.total) || 0,
          attendanceRate: parseFloat(attendanceRate)
        },
        recentActivity
      }
    });
  } catch (error) {
    console.error('[DASHBOARD] Unhandled error:', error.message);
    console.error('[DASHBOARD] Error stack:', error.stack);
    res.status(500).json({ success: false, error: 'Failed to fetch admin analytics' });
  }
};

/**
 * Get teacher dashboard analytics
 * Includes: assigned classes, student count, pending grading tasks
 */
const getTeacherAnalytics = async (req, res) => {
  try {
    const schoolId = req.user.school_id;
    const userId = req.user.id;

    // Get teacher record
    const teacher = await db('teachers')
      .where('user_id', userId)
      .where('school_id', schoolId)
      .first();

    if (!teacher) {
      return res.status(404).json({ success: false, error: 'Teacher record not found' });
    }

    // Get assigned classes
    const assignedClasses = await db('classes')
      .join('grades', 'classes.grade_id', 'grades.id')
      .where('classes.teacher_id', teacher.id)
      .where('classes.school_id', schoolId)
      .select('classes.*', 'grades.name as grade_name')
      .count('* as count')
      .first();

    // Get total students in assigned classes
    const totalStudents = await db('students')
      .join('classes', 'students.class_id', 'classes.id')
      .where('classes.teacher_id', teacher.id)
      .where('students.school_id', schoolId)
      .count('* as count')
      .first();

    // Get pending grading tasks (assignments without grades)
    const pendingGrading = await db('student_grades')
      .join('students', 'student_grades.student_id', 'students.id')
      .join('classes', 'students.class_id', 'classes.id')
      .where('classes.teacher_id', teacher.id)
      .where('student_grades.school_id', schoolId)
      .whereNull('student_grades.grade')
      .count('* as count')
      .first();

    // Get recent submissions
    const recentSubmissions = await db('student_grades')
      .join('students', 'student_grades.student_id', 'students.id')
      .join('users', 'students.user_id', 'users.id')
      .join('classes', 'students.class_id', 'classes.id')
      .where('classes.teacher_id', teacher.id)
      .where('student_grades.school_id', schoolId)
      .whereNotNull('student_grades.grade')
      .select(
        'student_grades.*',
        'users.first_name',
        'users.last_name',
        'classes.name as class_name'
      )
      .orderBy('student_grades.updated_at', 'desc')
      .limit(5);

    res.json({
      success: true,
      data: {
        assignedClasses: parseInt(assignedClasses.count) || 0,
        totalStudents: parseInt(totalStudents.count) || 0,
        pendingGrading: parseInt(pendingGrading.count) || 0,
        recentSubmissions
      }
    });
  } catch (error) {
    console.error('Get teacher analytics error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch teacher analytics' });
  }
};

/**
 * Get student dashboard analytics
 * Includes: academic progress chart, attendance percentage, fee balance summary
 */
const getStudentAnalytics = async (req, res) => {
  try {
    const schoolId = req.user.school_id;
    const userId = req.user.id;

    // Get student record
    const student = await db('students')
      .where('user_id', userId)
      .where('school_id', schoolId)
      .first();

    if (!student) {
      return res.status(404).json({ success: false, error: 'Student record not found' });
    }

    // Get academic progress (grades by subject)
    const academicProgress = await db('student_grades')
      .join('subjects', 'student_grades.subject_id', 'subjects.id')
      .where('student_grades.student_id', student.id)
      .where('student_grades.school_id', schoolId)
      .select('subjects.name as subject', 'student_grades.grade')
      .orderBy('subjects.name');

    // Calculate average grade
    const grades = academicProgress.map(g => parseFloat(g.grade)).filter(g => !isNaN(g));
    const averageGrade = grades.length > 0 
      ? (grades.reduce((sum, g) => sum + g, 0) / grades.length).toFixed(1)
      : 0;

    // Get attendance percentage (last 30 days)
    const attendanceData = await db('attendance')
      .where('student_id', student.id)
      .where('date', '>=', db.raw("NOW() - INTERVAL '30 days'"))
      .select(
        db.raw('COUNT(*) FILTER (WHERE status = "present") as present'),
        db.raw('COUNT(*) FILTER (WHERE status = "absent") as absent'),
        db.raw('COUNT(*) FILTER (WHERE status = "late") as late'),
        db.raw('COUNT(*) as total')
      )
      .first();

    const attendancePercentage = attendanceData.total > 0
      ? ((parseInt(attendanceData.present) / parseInt(attendanceData.total)) * 100).toFixed(1)
      : 0;

    // Get fee balance summary
    const feeBalance = await db('invoices')
      .join('students', 'invoices.student_id', 'students.id')
      .where('students.user_id', userId)
      .where('invoices.school_id', schoolId)
      .select(
        db.raw('SUM(CASE WHEN status = "pending" THEN amount ELSE 0 END) as outstanding'),
        db.raw('SUM(CASE WHEN status = "paid" THEN amount ELSE 0 END) as paid'),
        db.raw('SUM(amount) as total')
      )
      .first();

    // Get recent grades
    const recentGrades = await db('student_grades')
      .join('subjects', 'student_grades.subject_id', 'subjects.id')
      .where('student_grades.student_id', student.id)
      .where('student_grades.school_id', schoolId)
      .whereNotNull('student_grades.grade')
      .select('student_grades.*', 'subjects.name as subject')
      .orderBy('student_grades.updated_at', 'desc')
      .limit(5);

    res.json({
      success: true,
      data: {
        academicProgress: {
          subjects: academicProgress,
          averageGrade: parseFloat(averageGrade)
        },
        attendance: {
          percentage: parseFloat(attendancePercentage),
          present: parseInt(attendanceData.present) || 0,
          absent: parseInt(attendanceData.absent) || 0,
          late: parseInt(attendanceData.late) || 0,
          total: parseInt(attendanceData.total) || 0
        },
        feeBalance: {
          outstanding: parseFloat(feeBalance.outstanding) || 0,
          paid: parseFloat(feeBalance.paid) || 0,
          total: parseFloat(feeBalance.total) || 0
        },
        recentGrades
      }
    });
  } catch (error) {
    console.error('Get student analytics error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch student analytics' });
  }
};

/**
 * Get parent dashboard analytics
 * Includes: children's academic progress, attendance, fee balances
 */
const getParentAnalytics = async (req, res) => {
  try {
    const schoolId = req.user.school_id;
    const userId = req.user.id;

    // Get parent record
    const parent = await db('parents')
      .where('user_id', userId)
      .where('school_id', schoolId)
      .first();

    if (!parent) {
      return res.status(404).json({ success: false, error: 'Parent record not found' });
    }

    // Get linked students
    const students = await db('parent_student_relationships')
      .join('students', 'parent_student_relationships.student_id', 'students.id')
      .join('users', 'students.user_id', 'users.id')
      .where('parent_student_relationships.parent_id', parent.id)
      .select('students.*', 'users.first_name', 'users.last_name');

    // Get analytics for each student
    const childrenAnalytics = await Promise.all(
      students.map(async (student) => {
        // Get average grade
        const grades = await db('student_grades')
          .where('student_id', student.id)
          .where('school_id', schoolId)
          .select('grade');
        
        const gradeValues = grades.map(g => parseFloat(g.grade)).filter(g => !isNaN(g));
        const averageGrade = gradeValues.length > 0 
          ? (gradeValues.reduce((sum, g) => sum + g, 0) / gradeValues.length).toFixed(1)
          : 0;

        // Get attendance
        const attendance = await db('attendance')
          .where('student_id', student.id)
          .where('date', '>=', db.raw("NOW() - INTERVAL '30 days'"))
          .select(
            db.raw('COUNT(*) FILTER (WHERE status = "present") as present'),
            db.raw('COUNT(*) as total')
          )
          .first();

        const attendancePercentage = attendance.total > 0
          ? ((parseInt(attendance.present) / parseInt(attendance.total)) * 100).toFixed(1)
          : 0;

        // Get fee balance
        const feeBalance = await db('invoices')
          .where('student_id', student.id)
          .where('school_id', schoolId)
          .where('status', 'pending')
          .sum('amount as total')
          .first();

        return {
          id: student.id,
          name: `${student.first_name} ${student.last_name}`,
          averageGrade: parseFloat(averageGrade),
          attendancePercentage: parseFloat(attendancePercentage),
          outstandingBalance: parseFloat(feeBalance.total) || 0
        };
      })
    );

    res.json({
      success: true,
      data: {
        totalChildren: students.length,
        children: childrenAnalytics
      }
    });
  } catch (error) {
    console.error('Get parent analytics error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch parent analytics' });
  }
};

module.exports = {
  getAdminAnalytics,
  getTeacherAnalytics,
  getStudentAnalytics,
  getParentAnalytics
};
