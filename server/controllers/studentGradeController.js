const db = require('../config/database');
const { logAction } = require('../middleware/audit');

/**
 * Get student grades
 */
const getStudentGrades = async (req, res) => {
  try {
    const { student_id, course_id, term, academic_year } = req.query;
    const schoolId = req.user.school_id;
    const userRole = req.user.role;

    // If user is a student, they can only see their own grades
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
          error: 'Access denied. Students can only view their own grades.'
        });
      }
    }

    // If user is a parent, they can only see their children's grades
    if (userRole === 'parent') {
      const parent = await db('parents').where('user_id', req.user.id).first();
      if (!parent) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }

      const childRelation = await db('parent_student_relationships')
        .where('parent_id', parent.id)
        .where('student_id', student_id)
        .first();

      if (!childRelation) {
        return res.status(403).json({
          success: false,
          error: 'Access denied - not your child'
        });
      }
    }

    let query = db('student_grades')
      .select(
        'student_grades.id',
        'student_grades.course_id',
        'student_grades.grade_type',
        'student_grades.score',
        'student_grades.total_points',
        'student_grades.letter_grade',
        'student_grades.remarks',
        'student_grades.term',
        'student_grades.academic_year',
        'student_grades.created_at',
        'students.id as student_id',
        'students.student_id as student_number',
        'users.first_name',
        'users.last_name',
        'courses.name as course_name',
        'assignments.title as assignment_title',
        'quizzes.title as quiz_title'
      )
      .join('students', 'student_grades.student_id', 'students.id')
      .join('users', 'students.user_id', 'users.id')
      .join('courses', 'student_grades.course_id', 'courses.id')
      .leftJoin('assignments', 'student_grades.assignment_id', 'assignments.id')
      .leftJoin('quizzes', 'student_grades.quiz_id', 'quizzes.id')
      .where('student_grades.school_id', schoolId);

    if (targetStudentId) {
      query = query.where('student_grades.student_id', targetStudentId);
    }

    if (course_id) {
      query = query.where('student_grades.course_id', course_id);
    }

    if (term) {
      query = query.where('student_grades.term', term);
    }

    if (academic_year) {
      query = query.where('student_grades.academic_year', academic_year);
    }

    const grades = await query.orderBy('student_grades.created_at', 'desc');

    res.json({
      success: true,
      data: grades
    });
  } catch (error) {
    console.error('Error fetching student grades:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch student grades'
    });
  }
};

/**
 * Create student grade
 */
const createStudentGrade = async (req, res) => {
  try {
    const { student_id, course_id, assignment_id, quiz_id, grade_type, score, total_points, letter_grade, remarks, term, academic_year } = req.body;
    const schoolId = req.user.school_id;
    const gradedBy = req.user.id;

    // Calculate percentage if not provided
    let percentage = null;
    if (score && total_points) {
      percentage = (score / total_points) * 100;
    }

    const [grade] = await db('student_grades')
      .insert({
        id: db.raw('gen_random_uuid()'),
        school_id: schoolId,
        student_id,
        course_id,
        assignment_id,
        quiz_id,
        grade_type,
        score,
        total_points,
        letter_grade,
        remarks,
        term,
        academic_year,
        graded_by: gradedBy
      })
      .returning('*');

    // Log grade creation
    await logAction(schoolId, req.user.id, 'create', 'student_grade', grade.id, null, grade, req.ip, req.headers['user-agent']);

    res.status(201).json({
      success: true,
      data: grade
    });
  } catch (error) {
    console.error('Error creating student grade:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create student grade'
    });
  }
};

/**
 * Update student grade
 */
const updateStudentGrade = async (req, res) => {
  try {
    const { id } = req.params;
    const { score, total_points, letter_grade, remarks } = req.body;
    const schoolId = req.user.school_id;

    // Get old values
    const oldGrade = await db('student_grades')
      .where({ id, school_id: schoolId })
      .first();

    if (!oldGrade) {
      return res.status(404).json({
        success: false,
        error: 'Student grade not found'
      });
    }

    const [grade] = await db('student_grades')
      .where({ id, school_id: schoolId })
      .update({
        score,
        total_points,
        letter_grade,
        remarks,
        updated_at: db.fn.now()
      })
      .returning('*');

    // Log grade update
    await logAction(schoolId, req.user.id, 'update', 'student_grade', id, oldGrade, grade, req.ip, req.headers['user-agent']);

    res.json({
      success: true,
      data: grade
    });
  } catch (error) {
    console.error('Error updating student grade:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update student grade'
    });
  }
};

/**
 * Delete student grade
 */
const deleteStudentGrade = async (req, res) => {
  try {
    const { id } = req.params;
    const schoolId = req.user.school_id;

    // Get old values
    const oldGrade = await db('student_grades')
      .where({ id, school_id: schoolId })
      .first();

    if (!oldGrade) {
      return res.status(404).json({
        success: false,
        error: 'Student grade not found'
      });
    }

    const deleted = await db('student_grades')
      .where({ id, school_id: schoolId })
      .del();

    // Log grade deletion
    await logAction(schoolId, req.user.id, 'delete', 'student_grade', id, oldGrade, null, req.ip, req.headers['user-agent']);

    res.json({
      success: true,
      message: 'Student grade deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting student grade:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete student grade'
    });
  }
};

/**
 * Generate student grade report
 */
const generateGradeReport = async (req, res) => {
  try {
    const { student_id, term, academic_year } = req.query;
    const schoolId = req.user.school_id;

    let query = db('student_grades')
      .select(
        'courses.name as course_name',
        db.raw('AVG(student_grades.score) as average_score'),
        db.raw('AVG(student_grades.total_points) as average_total_points'),
        db.raw('ROUND((AVG(student_grades.score) / NULLIF(AVG(student_grades.total_points), 0)) * 100, 2) as average_percentage'),
        db.raw('COUNT(*) as total_grades')
      )
      .join('students', 'student_grades.student_id', 'students.id')
      .join('courses', 'student_grades.course_id', 'courses.id')
      .where('student_grades.school_id', schoolId)
      .groupBy('courses.name');

    if (student_id) {
      query = query.where('student_grades.student_id', student_id);
    }

    if (term) {
      query = query.where('student_grades.term', term);
    }

    if (academic_year) {
      query = query.where('student_grades.academic_year', academic_year);
    }

    const report = await query.orderBy('courses.name');

    // Calculate overall GPA
    const overallStats = await db('student_grades')
      .select(
        db.raw('AVG(student_grades.score) as overall_average_score'),
        db.raw('AVG(student_grades.total_points) as overall_average_total_points'),
        db.raw('ROUND((AVG(student_grades.score) / NULLIF(AVG(student_grades.total_points), 0)) * 100, 2) as overall_percentage')
      )
      .where('student_grades.school_id', schoolId);

    if (student_id) {
      overallStats.where('student_grades.student_id', student_id);
    }

    if (term) {
      overallStats.where('student_grades.term', term);
    }

    if (academic_year) {
      overallStats.where('student_grades.academic_year', academic_year);
    }

    const [overall] = await overallStats;

    res.json({
      success: true,
      data: {
        by_course: report,
        overall: overall
      }
    });
  } catch (error) {
    console.error('Error generating grade report:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate grade report'
    });
  }
};

module.exports = {
  getStudentGrades,
  createStudentGrade,
  updateStudentGrade,
  deleteStudentGrade,
  generateGradeReport
};
