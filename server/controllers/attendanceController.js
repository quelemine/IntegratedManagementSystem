const db = require('../config/database');

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
      .where('attendance.student_id', student_id)
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
     join('students', 'attendance.student_id', 'students.id')
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

module.exports = {
  getClassAttendance,
  getStudentAttendance,
  createAttendance,
  updateAttendance,
  deleteAttendance,
  generateAttendanceReport
};
