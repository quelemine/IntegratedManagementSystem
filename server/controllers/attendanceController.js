const db = require('../config/database');
const { logAction } = require('../middleware/audit');

/**
 * Get attendance by class and date
 */
const getClassAttendance = async (req, res) => {
  try {
    const { class_id, date } = req.query;
    const schoolId = req.user.school_id;

    let query = db('attendance')
      .select(
        'attendance.id',
        'attendance.date',
        'attendance.status',
        'attendance.remarks',
        'attendance.created_at',
        'attendance.student_id',
        'attendance.class_id',
        'students.student_id as student_number',
        'users.first_name',
        'users.last_name',
        'users.email',
        'classes.name as class_name'
      )
      .join('students', 'attendance.student_id', 'students.id')
      .join('users', 'students.user_id', 'users.id')
      .join('classes', 'attendance.class_id', 'classes.id')
      .where('attendance.school_id', schoolId);

    if (class_id) {
      query = query.where('attendance.class_id', class_id);
    }

    if (date) {
      query = query.where('attendance.date', date);
    }

    const attendance = await query.orderBy('attendance.date', 'desc');

    res.json({
      success: true,
      data: attendance
    });
  } catch (error) {
    console.error('Error fetching class attendance:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch attendance'
    });
  }
};

/**
 * Get attendance by student
 */
const getStudentAttendance = async (req, res) => {
  try {
    const { student_id } = req.params;
    const schoolId = req.user.school_id;
    const userRole = req.user.role;

    // If user is a student, they can only see their own attendance
    let targetStudentId = student_id;
    if (userRole === 'student') {
      // Get the student record for this user
      const studentRecord = await db('students')
        .where('user_id', req.user.id)
        .where('school_id', schoolId)
        .first();
      
      if (!studentRecord) {
        return res.status(404).json({
          success: false,
          error: 'Student record not found'
        });
      }
      
      targetStudentId = studentRecord.id;
      
      // If student_id was provided and doesn't match, deny access
      if (student_id && student_id !== targetStudentId) {
        return res.status(403).json({
          success: false,
          error: 'Access denied. Students can only view their own attendance.'
        });
      }
    }

    const attendance = await db('attendance')
      .select(
        'attendance.id',
        'attendance.date',
        'attendance.status',
        'attendance.remarks',
        'attendance.created_at',
        'classes.name as class_name'
      )
      .join('classes', 'attendance.class_id', 'classes.id')
      .where('attendance.student_id', targetStudentId)
      .where('attendance.school_id', schoolId)
      .orderBy('attendance.date', 'desc');

    res.json({
      success: true,
      data: attendance
    });
  } catch (error) {
    console.error('Error fetching student attendance:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch student attendance'
    });
  }
};

/**
 * Create attendance record
 */
const createAttendance = async (req, res) => {
  try {
    const { student_id, class_id, date, status, remarks } = req.body;
    const schoolId = req.user.school_id;
    const recordedBy = req.user.id;

    // Validate required fields
    if (!student_id) {
      return res.status(400).json({
        success: false,
        error: 'student_id is required'
      });
    }
    if (!class_id) {
      return res.status(400).json({
        success: false,
        error: 'class_id is required'
      });
    }
    if (!date) {
      return res.status(400).json({
        success: false,
        error: 'date is required'
      });
    }
    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'status is required'
      });
    }

    // Check if attendance already exists for this student, class, and date
    const existing = await db('attendance')
      .where({
        student_id,
        class_id,
        date,
        school_id: schoolId
      })
      .first();

    if (existing) {
      return res.status(400).json({
        success: false,
        error: 'Attendance already recorded for this student on this date'
      });
    }

    const [attendance] = await db('attendance')
      .insert({
        id: db.raw('gen_random_uuid()'),
        school_id: schoolId,
        student_id,
        class_id,
        date,
        status,
        remarks,
        recorded_by: recordedBy
      })
      .returning('*');

    // Log audit
    await logAction(
      schoolId,
      recordedBy,
      'create',
      'attendance',
      attendance.id,
      null,
      { student_id, class_id, date, status },
      req.ip,
      req.headers['user-agent']
    );

    // Check attendance threshold and notify parents if needed
    await checkAttendanceThreshold(student_id, schoolId);

    res.status(201).json({
      success: true,
      data: attendance
    });
  } catch (error) {
    console.error('Error creating attendance:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create attendance'
    });
  }
};

/**
 * Update attendance record
 */
const updateAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;
    const schoolId = req.user.school_id;

    const [attendance] = await db('attendance')
      .where({ id, school_id: schoolId })
      .update({
        status,
        remarks
      })
      .returning('*');

    if (!attendance) {
      return res.status(404).json({
        success: false,
        error: 'Attendance record not found'
      });
    }

    res.json({
      success: true,
      data: attendance
    });
  } catch (error) {
    console.error('Error updating attendance:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update attendance'
    });
  }
};

/**
 * Delete attendance record
 */
const deleteAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const schoolId = req.user.school_id;

    const deleted = await db('attendance')
      .where({ id, school_id: schoolId })
      .del();

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Attendance record not found'
      });
    }

    res.json({
      success: true,
      message: 'Attendance deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting attendance:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete attendance'
    });
  }
};

/**
 * Generate attendance report
 */
const generateAttendanceReport = async (req, res) => {
  try {
    const { class_id, start_date, end_date } = req.query;
    const schoolId = req.user.school_id;

    let query = db('attendance')
      .select(
        'students.id as student_id',
        'students.student_id as student_number',
        'students.first_name',
        'students.last_name',
        db.raw('COUNT(*) FILTER (WHERE attendance.status = \'present\') as present_count'),
        db.raw('COUNT(*) FILTER (WHERE attendance.status = \'absent\') as absent_count'),
        db.raw('COUNT(*) FILTER (WHERE attendance.status = \'late\') as late_count'),
        db.raw('COUNT(*) FILTER (WHERE attendance.status = \'excused\') as excused_count'),
        db.raw('COUNT(*) as total_days'),
        db.raw('ROUND((COUNT(*) FILTER (WHERE attendance.status = \'present\')::float / NULLIF(COUNT(*), 0)) * 100, 2) as attendance_percentage')
      )
      .join('students', 'attendance.student_id', 'students.id')
      .where('attendance.school_id', schoolId)
      .groupBy('students.id', 'students.student_id', 'students.first_name', 'students.last_name');

    if (class_id) {
      query = query.where('attendance.class_id', class_id);
    }

    if (start_date) {
      query = query.where('attendance.date', '>=', start_date);
    }

    if (end_date) {
      query = query.where('attendance.date', '<=', end_date);
    }

    const report = await query.orderBy('students.last_name', 'students.first_name');

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Error generating attendance report:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate attendance report'
    });
  }
};

/**
 * Bulk create attendance records for a class
 */
const bulkCreateAttendance = async (req, res) => {
  try {
    const { class_id, date, attendance_records } = req.body;
    const schoolId = req.user.school_id;
    const recordedBy = req.user.id;

    if (!class_id || !date || !attendance_records || !Array.isArray(attendance_records)) {
      return res.status(400).json({
        success: false,
        error: 'class_id, date, and attendance_records array are required'
      });
    }

    const results = [];
    for (const record of attendance_records) {
      const { student_id, status, remarks } = record;

      // Check if attendance already exists
      const existing = await db('attendance')
        .where({
          student_id,
          class_id,
          date,
          school_id
        })
        .first();

      if (existing) {
        // Update existing record
        const [updated] = await db('attendance')
          .where({ id: existing.id })
          .update({ status, remarks })
          .returning('*');
        results.push(updated);
      } else {
        // Create new record
        const [created] = await db('attendance')
          .insert({
            id: db.raw('gen_random_uuid()'),
            school_id,
            student_id,
            class_id,
            date,
            status,
            remarks,
            recorded_by: recordedBy
          })
          .returning('*');
        results.push(created);

        // Check attendance threshold for each student
        await checkAttendanceThreshold(student_id, schoolId);
      }
    }

    res.status(201).json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Error bulk creating attendance:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to bulk create attendance'
    });
  }
};

/**
 * Get attendance statistics for admin
 */
const getAttendanceStatistics = async (req, res) => {
  try {
    const { start_date, end_date, class_id } = req.query;
    const schoolId = req.user.school_id;

    let query = db('attendance')
      .select(
        db.raw('COUNT(*) FILTER (WHERE status = \'present\') as present'),
        db.raw('COUNT(*) FILTER (WHERE status = \'absent\') as absent'),
        db.raw('COUNT(*) FILTER (WHERE status = \'late\') as late'),
        db.raw('COUNT(*) FILTER (WHERE status = \'excused\') as excused'),
        db.raw('COUNT(*) as total')
      )
      .where('school_id', schoolId);

    if (start_date) {
      query = query.where('date', '>=', start_date);
    }
    if (end_date) {
      query = query.where('date', '<=', end_date);
    }
    if (class_id) {
      query = query.where('class_id', class_id);
    }

    const stats = await query.first();

    // Get monthly statistics
    const monthlyStats = await db('attendance')
      .select(
        db.raw('TO_CHAR(date, \'YYYY-MM\') as month'),
        db.raw('COUNT(*) FILTER (WHERE status = \'present\') as present'),
        db.raw('COUNT(*) FILTER (WHERE status = \'absent\') as absent'),
        db.raw('COUNT(*) FILTER (WHERE status = \'late\') as late'),
        db.raw('COUNT(*) as total')
      )
      .where('school_id', schoolId)
      .where('date', '>=', db.raw("NOW() - INTERVAL '6 months'"))
      .groupBy(db.raw('TO_CHAR(date, \'YYYY-MM\')'))
      .orderBy(db.raw('month'));

    res.json({
      success: true,
      data: {
        overall: stats,
        monthly: monthlyStats
      }
    });
  } catch (error) {
    console.error('Error getting attendance statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get attendance statistics'
    });
  }
};

/**
 * Get attendance calendar for a student
 */
const getStudentAttendanceCalendar = async (req, res) => {
  try {
    const { student_id } = req.params;
    const { month, year } = req.query;
    const schoolId = req.user.school_id;
    const userRole = req.user.role;

    // If user is a student, they can only see their own attendance
    let targetStudentId = student_id;
    if (userRole === 'student') {
      const studentRecord = await db('students')
        .where('user_id', req.user.id)
        .where('school_id', schoolId)
        .first();
      
      if (!studentRecord) {
        return res.status(404).json({
          success: false,
          error: 'Student record not found'
        });
      }
      
      targetStudentId = studentRecord.id;
      
      if (student_id && student_id !== targetStudentId) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }
    }

    // If user is a parent, check if they're linked to this student
    if (userRole === 'parent') {
      const parent = await db('parents')
        .where('user_id', req.user.id)
        .where('school_id', schoolId)
        .first();
      
      if (!parent) {
        return res.status(404).json({
          success: false,
          error: 'Parent record not found'
        });
      }

      const relationship = await db('parent_student_relationships')
        .where('parent_id', parent.id)
        .where('student_id', targetStudentId)
        .first();
      
      if (!relationship) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }
    }

    let query = db('attendance')
      .select('date', 'status', 'remarks')
      .where('student_id', targetStudentId)
      .where('school_id', schoolId);

    if (month && year) {
      query = query.whereRaw("TO_CHAR(date, 'YYYY-MM') = ?", `${year}-${month.padStart(2, '0')}`);
    }

    const attendance = await query.orderBy('date');

    res.json({
      success: true,
      data: attendance
    });
  } catch (error) {
    console.error('Error getting student attendance calendar:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get attendance calendar'
    });
  }
};

/**
 * Check attendance threshold and notify parents if needed
 */
const checkAttendanceThreshold = async (studentId, schoolId) => {
  try {
    const threshold = 75; // 75% attendance threshold

    // Get attendance for the last 30 days
    const attendance = await db('attendance')
      .select(
        db.raw('COUNT(*) FILTER (WHERE status = \'present\') as present'),
        db.raw('COUNT(*) FILTER (WHERE status = \'absent\') as absent'),
        db.raw('COUNT(*) as total')
      )
      .where('student_id', studentId)
      .where('school_id', schoolId)
      .where('date', '>=', db.raw("NOW() - INTERVAL '30 days'"))
      .first();

    if (!attendance || attendance.total === 0) {
      return;
    }

    const attendanceRate = (parseInt(attendance.present) / parseInt(attendance.total)) * 100;

    if (attendanceRate < threshold) {
      // Get student info
      const student = await db('students')
        .join('users', 'students.user_id', 'users.id')
        .where('students.id', studentId)
        .select('users.first_name', 'users.last_name')
        .first();

      // Get parents
      const parents = await db('parent_student_relationships')
        .join('parents', 'parent_student_relationships.parent_id', 'parents.id')
        .join('users', 'parents.user_id', 'users.id')
        .where('parent_student_relationships.student_id', studentId)
        .select('users.id as user_id', 'users.first_name', 'users.last_name', 'users.email');

      // Create notification for each parent
      for (const parent of parents) {
        await db('notifications').insert({
          user_id: parent.user_id,
          title: 'Low Attendance Alert',
          message: `${student.first_name} ${student.last_name}'s attendance has dropped to ${attendanceRate.toFixed(1)}%. Please contact the school.`,
          type: 'attendance',
          reference_id: studentId,
          reference_type: 'student',
          is_read: false
        });
      }
    }
  } catch (error) {
    console.error('Error checking attendance threshold:', error);
  }
};

module.exports = {
  getClassAttendance,
  getStudentAttendance,
  createAttendance,
  updateAttendance,
  deleteAttendance,
  generateAttendanceReport,
  bulkCreateAttendance,
  getAttendanceStatistics,
  getStudentAttendanceCalendar
};
