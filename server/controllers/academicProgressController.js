const db = require('../config/database');

/**
 * Get student's academic progress
 */
const getStudentProgress = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { term, academicYear } = req.query;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Students can only view their own progress
    if (userRole === 'student') {
      const student = await db('students').where('user_id', userId).first();
      if (!student || student.id !== studentId) {
        return res.status(403).json({ success: false, error: 'Access denied' });
      }
    }

    // Parents can only view their children's progress
    if (userRole === 'parent') {
      const parent = await db('parents').where('user_id', userId).first();
      if (!parent) {
        return res.status(403).json({ success: false, error: 'Access denied' });
      }

      const childRelation = await db('parent_student_relationships')
        .where('parent_id', parent.id)
        .where('student_id', studentId)
        .first();

      if (!childRelation) {
        return res.status(403).json({ success: false, error: 'Access denied - not your child' });
      }
    }

    let query = db('academic_progress')
      .where('student_id', studentId);

    if (term) query = query.where('term', term);
    if (academicYear) query = query.where('academic_year', academicYear);

    const progress = await query.orderBy('academic_year', 'desc').orderBy('term', 'desc');

    res.json({ success: true, data: progress });
  } catch (error) {
    console.error('Get student progress error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch academic progress' });
  }
};

/**
 * Get subject performance for a student
 */
const getSubjectPerformance = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { academicProgressId } = req.query;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Students can only view their own performance
    if (userRole === 'student') {
      const student = await db('students').where('user_id', userId).first();
      if (!student || student.id !== studentId) {
        return res.status(403).json({ success: false, error: 'Access denied' });
      }
    }

    // Parents can only view their children's performance
    if (userRole === 'parent') {
      const parent = await db('parents').where('user_id', userId).first();
      if (!parent) {
        return res.status(403).json({ success: false, error: 'Access denied' });
      }

      const childRelation = await db('parent_student_relationships')
        .where('parent_id', parent.id)
        .where('student_id', studentId)
        .first();

      if (!childRelation) {
        return res.status(403).json({ success: false, error: 'Access denied - not your child' });
      }
    }

    let query = db('subject_performance')
      .join('courses', 'subject_performance.course_id', 'courses.id')
      .select(
        'subject_performance.*',
        'courses.name as course_name',
        'courses.code as course_code'
      );

    if (academicProgressId) {
      query = query.where('subject_performance.academic_progress_id', academicProgressId);
    } else {
      const progressIds = await db('academic_progress')
        .where('student_id', studentId)
        .pluck('id');
      query = query.whereIn('subject_performance.academic_progress_id', progressIds);
    }

    const performance = await query.orderBy('subject_performance.created_at', 'desc');

    res.json({ success: true, data: performance });
  } catch (error) {
    console.error('Get subject performance error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch subject performance' });
  }
};

/**
 * Calculate GPA from grades
 */
const calculateGPA = (grades) => {
  if (!grades || grades.length === 0) return 0;

  const gradePoints = {
    'A': 4.0,
    'A-': 3.7,
    'B+': 3.3,
    'B': 3.0,
    'B-': 2.7,
    'C+': 2.3,
    'C': 2.0,
    'C-': 1.7,
    'D+': 1.3,
    'D': 1.0,
    'F': 0.0
  };

  let totalPoints = 0;
  let count = 0;

  for (const grade of grades) {
    const points = gradePoints[grade.letter_grade];
    if (points !== undefined) {
      totalPoints += points;
      count++;
    }
  }

  return count > 0 ? (totalPoints / count).toFixed(2) : 0;
};

/**
 * Determine performance level
 */
const getPerformanceLevel = (gpa) => {
  if (gpa >= 3.7) return 'excellent';
  if (gpa >= 3.0) return 'good';
  if (gpa >= 2.0) return 'satisfactory';
  return 'needs_improvement';
};

/**
 * Create or update academic progress
 */
const updateAcademicProgress = async (req, res) => {
  try {
    const { studentId } = req.params;
    const {
      term,
      academic_year,
      gpa,
      attendance_percentage,
      total_assignments,
      completed_assignments,
      total_exams,
      average_exam_score,
      teacher_comments,
      overall_performance
    } = req.body;

    const userId = req.user.id;
    const schoolId = req.user.school_id;

    // Check if progress exists
    const existing = await db('academic_progress')
      .where('student_id', studentId)
      .where('term', term)
      .where('academic_year', academic_year)
      .first();

    const assignmentCompletionRate = total_assignments > 0 
      ? ((completed_assignments / total_assignments) * 100).toFixed(2)
      : 0;

    const performanceLevel = getPerformanceLevel(parseFloat(gpa));

    let progress;
    if (existing) {
      [progress] = await db('academic_progress')
        .where('id', existing.id)
        .update({
          gpa,
          attendance_percentage,
          total_assignments,
          completed_assignments,
          assignment_completion_rate,
          total_exams,
          average_exam_score,
          teacher_comments,
          overall_performance,
          performance_level,
          updated_at: db.raw('NOW()')
        })
        .returning('*');
    } else {
      [progress] = await db('academic_progress')
        .insert({
          id: db.raw('gen_random_uuid()'),
          school_id: schoolId,
          student_id: studentId,
          term,
          academic_year,
          gpa,
          attendance_percentage,
          total_assignments,
          completed_assignments,
          assignment_completion_rate,
          total_exams,
          average_exam_score,
          teacher_comments,
          overall_performance,
          performance_level,
          graded_by: userId
        })
        .returning('*');
    }

    res.json({ success: true, data: progress });
  } catch (error) {
    console.error('Update academic progress error:', error);
    res.status(500).json({ success: false, error: 'Failed to update academic progress' });
  }
};

/**
 * Add or update subject performance
 */
const updateSubjectPerformance = async (req, res) => {
  try {
    const { academicProgressId } = req.params;
    const {
      course_id,
      subject_name,
      average_score,
      letter_grade,
      attendance_percentage,
      assignments_completed,
      total_assignments,
      teacher_comments
    } = req.body;

    // Check if subject performance exists
    const existing = await db('subject_performance')
      .where('academic_progress_id', academicProgressId)
      .where('course_id', course_id)
      .first();

    let performance;
    if (existing) {
      [performance] = await db('subject_performance')
        .where('id', existing.id)
        .update({
          average_score,
          letter_grade,
          attendance_percentage,
          assignments_completed,
          total_assignments,
          teacher_comments,
          updated_at: db.raw('NOW()')
        })
        .returning('*');
    } else {
      [performance] = await db('subject_performance')
        .insert({
          id: db.raw('gen_random_uuid()'),
          academic_progress_id: academicProgressId,
          course_id,
          subject_name,
          average_score,
          letter_grade,
          attendance_percentage,
          assignments_completed,
          total_assignments,
          teacher_comments
        })
        .returning('*');
    }

    res.json({ success: true, data: performance });
  } catch (error) {
    console.error('Update subject performance error:', error);
    res.status(500).json({ success: false, error: 'Failed to update subject performance' });
  }
};

/**
 * Get class performance (for teachers)
 */
const getClassPerformance = async (req, res) => {
  try {
    const { classId } = req.params;
    const { term, academicYear } = req.query;
    const userId = req.user.id;

    // Verify teacher has access to this class
    const teacherClass = await db('class_teachers')
      .where('class_id', classId)
      .where('teacher_id', userId)
      .first();

    if (!teacherClass && req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    let query = db('academic_progress')
      .join('students', 'academic_progress.student_id', 'students.id')
      .join('users', 'students.user_id', 'users.id')
      .join('student_classes', 'students.id', 'student_classes.student_id')
      .select(
        'academic_progress.*',
        'users.first_name',
        'users.last_name',
        'users.email'
      )
      .where('student_classes.class_id', classId);

    if (term) query = query.where('academic_progress.term', term);
    if (academicYear) query = query.where('academic_progress.academic_year', academicYear);

    const performance = await query.orderBy('academic_progress.gpa', 'desc');

    res.json({ success: true, data: performance });
  } catch (error) {
    console.error('Get class performance error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch class performance' });
  }
};

/**
 * Get school-wide academic reports (for admins)
 */
const getSchoolReports = async (req, res) => {
  try {
    const schoolId = req.user.school_id;
    const { term, academicYear } = req.query;

    let query = db('academic_progress')
      .join('students', 'academic_progress.student_id', 'students.id')
      .join('users', 'students.user_id', 'users.id')
      .select(
        'academic_progress.*',
        'users.first_name',
        'users.last_name',
        'users.email'
      )
      .where('academic_progress.school_id', schoolId);

    if (term) query = query.where('academic_progress.term', term);
    if (academicYear) query = query.where('academic_progress.academic_year', academicYear);

    const reports = await query.orderBy('academic_progress.gpa', 'desc');

    // Calculate statistics
    const stats = {
      total_students: reports.length,
      average_gpa: 0,
      average_attendance: 0,
      performance_levels: {
        excellent: 0,
        good: 0,
        satisfactory: 0,
        needs_improvement: 0
      }
    };

    if (reports.length > 0) {
      const totalGpa = reports.reduce((sum, r) => sum + parseFloat(r.gpa || 0), 0);
      const totalAttendance = reports.reduce((sum, r) => sum + parseFloat(r.attendance_percentage || 0), 0);
      
      stats.average_gpa = (totalGpa / reports.length).toFixed(2);
      stats.average_attendance = (totalAttendance / reports.length).toFixed(2);

      reports.forEach(r => {
        stats.performance_levels[r.performance_level]++;
      });
    }

    res.json({ success: true, data: { reports, stats } });
  } catch (error) {
    console.error('Get school reports error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch school reports' });
  }
};

/**
 * Get top performing students
 */
const getTopStudents = async (req, res) => {
  try {
    const schoolId = req.user.school_id;
    const { limit = 10, term, academicYear } = req.query;

    let query = db('academic_progress')
      .join('students', 'academic_progress.student_id', 'students.id')
      .join('users', 'students.user_id', 'users.id')
      .select(
        'academic_progress.*',
        'users.first_name',
        'users.last_name',
        'users.email'
      )
      .where('academic_progress.school_id', schoolId)
      .where('academic_progress.gpa', '>', 0);

    if (term) query = query.where('academic_progress.term', term);
    if (academicYear) query = query.where('academic_progress.academic_year', academicYear);

    const topStudents = await query
      .orderBy('academic_progress.gpa', 'desc')
      .limit(limit);

    res.json({ success: true, data: topStudents });
  } catch (error) {
    console.error('Get top students error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch top students' });
  }
};

/**
 * Get students needing attention
 */
const getStudentsNeedingAttention = async (req, res) => {
  try {
    const schoolId = req.user.school_id;
    const { term, academicYear } = req.query;

    let query = db('academic_progress')
      .join('students', 'academic_progress.student_id', 'students.id')
      .join('users', 'students.user_id', 'users.id')
      .select(
        'academic_progress.*',
        'users.first_name',
        'users.last_name',
        'users.email'
      )
      .where('academic_progress.school_id', schoolId)
      .where('academic_progress.performance_level', 'needs_improvement');

    if (term) query = query.where('academic_progress.term', term);
    if (academicYear) query = query.where('academic_progress.academic_year', academicYear);

    const students = await query.orderBy('academic_progress.gpa', 'asc');

    res.json({ success: true, data: students });
  } catch (error) {
    console.error('Get students needing attention error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch students needing attention' });
  }
};

/**
 * Get academic history for a student
 */
const getAcademicHistory = async (req, res) => {
  try {
    const { studentId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Students can only view their own history
    if (userRole === 'student') {
      const student = await db('students').where('user_id', userId).first();
      if (!student || student.id !== studentId) {
        return res.status(403).json({ success: false, error: 'Access denied' });
      }
    }

    // Parents can only view their children's history
    if (userRole === 'parent') {
      const parent = await db('parents').where('user_id', userId).first();
      if (!parent) {
        return res.status(403).json({ success: false, error: 'Access denied' });
      }

      const childRelation = await db('parent_student_relationships')
        .where('parent_id', parent.id)
        .where('student_id', studentId)
        .first();

      if (!childRelation) {
        return res.status(403).json({ success: false, error: 'Access denied - not your child' });
      }
    }

    const history = await db('academic_progress')
      .where('student_id', studentId)
      .orderBy('academic_year', 'desc')
      .orderBy('term', 'desc');

    res.json({ success: true, data: history });
  } catch (error) {
    console.error('Get academic history error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch academic history' });
  }
};

module.exports = {
  getStudentProgress,
  getSubjectPerformance,
  updateAcademicProgress,
  updateSubjectPerformance,
  getClassPerformance,
  getSchoolReports,
  getTopStudents,
  getStudentsNeedingAttention,
  getAcademicHistory
};
