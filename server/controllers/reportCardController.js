const db = require('../config/database');

/**
 * Check if student has outstanding fees
 */
const checkStudentFees = async (studentId, schoolId) => {
  try {
    // Get total assigned fees (invoices) - use total_amount column
    const totalFees = await db('invoices')
      .where('student_id', studentId)
      .where('school_id', schoolId)
      .where('status', '!=', 'cancelled')
      .sum('total_amount as total')
      .first();

    // Get total payments
    const totalPayments = await db('payments')
      .where('student_id', studentId)
      .where('school_id', schoolId)
      .where('status', 'completed')
      .sum('amount as total')
      .first();

    const outstandingBalance = (totalFees?.total || 0) - (totalPayments?.total || 0);

    return {
      hasOutstandingBalance: outstandingBalance > 0,
      outstandingBalance: outstandingBalance,
      totalFees: totalFees?.total || 0,
      totalPayments: totalPayments?.total || 0
    };
  } catch (error) {
    console.error('Error checking student fees:', error);
    throw error;
  }
};

/**
 * Get student academic data for report card
 */
const getStudentAcademicData = async (studentId, schoolId, academicYear) => {
  try {
    console.log('[REPORT CARD] Fetching academic data for student:', studentId);
    
    // Get student details
    const student = await db('students as s')
      .select(
        's.id',
        's.student_id',
        'users.first_name',
        'users.last_name',
        's.grade_id',
        's.class_id',
        's.division_id',
        'grades.name as grade_name',
        'classes.name as class_name',
        'divisions.name as division_name'
      )
      .join('users', 's.user_id', 'users.id')
      .leftJoin('grades', 's.grade_id', 'grades.id')
      .leftJoin('classes', 's.class_id', 'classes.id')
      .leftJoin('divisions', 's.division_id', 'divisions.id')
      .where('s.id', studentId)
      .where('s.school_id', schoolId)
      .first();

    if (!student) {
      console.log('[REPORT CARD] Student not found');
      throw new Error('Student not found');
    }

    console.log('[REPORT CARD] Student found:', student.first_name, student.last_name);

    // Get class teacher
    const classTeacher = await db('teachers as t')
      .select(
        'users.first_name',
        'users.last_name',
        'users.email'
      )
      .join('users', 't.user_id', 'users.id')
      .join('classes', 't.id', 'classes.homeroom_teacher_id')
      .where('classes.id', student.class_id)
      .first();

    // Get student grades by subject (through courses)
    const grades = await db('student_grades as sg')
      .select(
        'courses.name as subject',
        'sg.score',
        'sg.term',
        'sg.letter_grade as grade',
        'sg.academic_year',
        'assignments.title as assignment_name',
        'exams.title as exam_name'
      )
      .leftJoin('courses', 'sg.course_id', 'courses.id')
      .leftJoin('assignments', 'sg.assignment_id', 'assignments.id')
      .leftJoin('exams', 'sg.exam_id', 'exams.id')
      .where('sg.student_id', studentId)
      .where('sg.school_id', schoolId)
      .where('sg.academic_year', academicYear)
      .orderBy('courses.name', 'asc')
      .orderBy('sg.term', 'asc');

    // Group grades by subject and term
    const subjectGrades = {};
    grades.forEach(grade => {
      const subject = grade.subject || 'General';
      const term = grade.term || 1;
      
      if (!subjectGrades[subject]) {
        subjectGrades[subject] = {
          subject: subject,
          term1: null,
          term2: null,
          term3: null,
          exam: null,
          yearlyAverage: 0,
          letterGrade: 'N/A'
        };
      }
      
      if (term === 1 && subjectGrades[subject].term1 === null) {
        subjectGrades[subject].term1 = grade.score;
      } else if (term === 2 && subjectGrades[subject].term2 === null) {
        subjectGrades[subject].term2 = grade.score;
      } else if (term === 3 && subjectGrades[subject].term3 === null) {
        subjectGrades[subject].term3 = grade.score;
      }
      
      if (grade.exam_name) {
        subjectGrades[subject].exam = grade.score;
      }
    });

    // Calculate yearly averages and letter grades
    Object.values(subjectGrades).forEach(subject => {
      const terms = [subject.term1, subject.term2, subject.term3].filter(v => v !== null);
      const exam = subject.exam;
      
      let total = 0;
      let count = 0;
      
      terms.forEach(score => {
        total += score;
        count++;
      });
      
      if (exam !== null) {
        total += exam;
        count++;
      }
      
      subject.yearlyAverage = count > 0 ? Math.round(total / count) : 0;
      subject.letterGrade = getLetterGrade(subject.yearlyAverage);
    });

    // Get attendance summary (filter by date range for academic year)
    const attendance = await db('attendance')
      .select('status')
      .where('student_id', studentId)
      .where('school_id', schoolId);

    const attendanceStats = {
      total: attendance.length,
      present: attendance.filter(a => a.status === 'present').length,
      absent: attendance.filter(a => a.status === 'absent').length,
      late: attendance.filter(a => a.status === 'late').length
    };

    // Get class size for ranking
    const classSize = await db('students')
      .where('class_id', student.class_id)
      .where('school_id', schoolId)
      .count('id as count')
      .first();

    // Calculate rank (simplified - based on average grade)
    const allClassGrades = await db('student_grades as sg')
      .select('sg.student_id')
      .avg('sg.score as avg_score')
      .join('students as s', 'sg.student_id', 's.id')
      .where('s.class_id', student.class_id)
      .where('sg.school_id', schoolId)
      .where('sg.academic_year', academicYear)
      .groupBy('sg.student_id')
      .orderBy('avg_score', 'desc');

    const studentAvg = Object.values(subjectGrades).reduce((sum, s) => sum + s.yearlyAverage, 0) / 
                      (Object.keys(subjectGrades).length || 1);
    
    let rank = 1;
    for (const classGrade of allClassGrades) {
      if (classGrade.student_id === studentId) {
        break;
      }
      rank++;
    }

    return {
      student: student,
      teacher: classTeacher,
      subjects: Object.values(subjectGrades),
      attendance: attendanceStats,
      classSize: classSize?.count || 0,
      rank: rank,
      overallAverage: Math.round(studentAvg),
      overallLetterGrade: getLetterGrade(Math.round(studentAvg))
    };
  } catch (error) {
    console.error('[REPORT CARD] Error fetching student academic data:', error);
    console.error('[REPORT CARD] Error stack:', error.stack);
    throw error;
  }
};

/**
 * Convert numeric score to letter grade
 */
const getLetterGrade = (score) => {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
};

/**
 * Get report card for student
 */
const getReportCard = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { academicYear } = req.query;
    const userId = req.user.id;
    const schoolId = req.user.school_id;
    const userRole = req.user.role;

    // Determine if user has access to this student's report card
    let hasAccess = false;
    
    if (userRole === 'student') {
      // Student can only view their own report card
      const student = await db('students').where('user_id', userId).where('id', studentId).first();
      hasAccess = !!student;
    } else if (userRole === 'parent') {
      // Parent can view report cards for their linked children
      const relationship = await db('parent_student_relationships as psr')
        .join('parents as p', 'psr.parent_id', 'p.id')
        .where('p.user_id', userId)
        .where('psr.student_id', studentId)
        .first();
      hasAccess = !!relationship;
    } else if (['super_admin', 'admin', 'principal', 'teacher'].includes(userRole)) {
      // Admins and teachers can view any student's report card
      hasAccess = true;
    }

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to view this report card'
      });
    }

    // Check fee restriction
    const feeStatus = await checkStudentFees(studentId, schoolId);
    
    if (feeStatus.hasOutstandingBalance && userRole !== 'super_admin' && userRole !== 'admin' && userRole !== 'principal') {
      return res.status(403).json({
        success: false,
        error: 'Report card access is restricted because there is an outstanding fee balance. Please clear your fees to access and print your report card.',
        feeStatus: feeStatus
      });
    }

    // Get academic data
    const currentYear = academicYear || new Date().getFullYear().toString();
    const academicData = await getStudentAcademicData(studentId, schoolId, currentYear);

    res.json({
      success: true,
      data: {
        ...academicData,
        feeStatus: feeStatus,
        academicYear: currentYear
      }
    });
  } catch (error) {
    console.error('Error fetching report card:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch report card'
    });
  }
};

/**
 * Get report cards for parent's children
 */
const getParentChildrenReportCards = async (req, res) => {
  try {
    console.log('[REPORT CARD] Parent children report cards request');
    const userId = req.user.id;
    const schoolId = req.user.school_id;
    const { academicYear } = req.query;

    console.log('[REPORT CARD] User ID:', userId);
    console.log('[REPORT CARD] School ID:', schoolId);

    // Get parent record
    const parent = await db('parents').where('user_id', userId).where('school_id', schoolId).first();
    if (!parent) {
      console.log('[REPORT CARD] Parent record not found');
      return res.status(404).json({
        success: false,
        error: 'Parent record not found'
      });
    }

    console.log('[REPORT CARD] Parent found:', parent.id);

    // Get parent's children
    const children = await db('parent_student_relationships as psr')
      .select('students.id as id', 'students.student_id', 'users.first_name', 'users.last_name')
      .join('students', 'psr.student_id', 'students.id')
      .join('users', 'students.user_id', 'users.id')
      .where('psr.parent_id', parent.id)
      .where('students.school_id', schoolId);

    console.log('[REPORT CARD] Children found:', children.length);

    const currentYear = academicYear || new Date().getFullYear().toString();
    const reportCards = [];

    for (const child of children) {
      console.log('[REPORT CARD] Processing child:', child.id, child.student_id);
      try {
        const feeStatus = await checkStudentFees(child.id, schoolId);
        console.log('[REPORT CARD] Fee status for child:', child.student_id, feeStatus);
        const academicData = await getStudentAcademicData(child.id, schoolId, currentYear);
        console.log('[REPORT CARD] Academic data for child:', child.student_id, 'loaded');
        
        reportCards.push({
          student: child,
          ...academicData,
          feeStatus: feeStatus,
          academicYear: currentYear,
          hasAccess: !feeStatus.hasOutstandingBalance
        });
      } catch (error) {
        console.error(`[REPORT CARD] Error fetching report card for student ${child.student_id}:`, error);
        console.error(`[REPORT CARD] Error stack:`, error.stack);
        // Still add the child with error info
        reportCards.push({
          student: child,
          error: error.message,
          hasAccess: false,
          feeStatus: { hasOutstandingBalance: false, outstandingBalance: 0, totalFees: 0, totalPayments: 0 }
        });
      }
    }

    res.json({
      success: true,
      data: reportCards
    });
  } catch (error) {
    console.error('Error fetching parent children report cards:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch report cards'
    });
  }
};

module.exports = {
  getReportCard,
  getParentChildrenReportCards,
  checkStudentFees
};
