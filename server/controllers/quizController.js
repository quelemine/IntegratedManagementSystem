const db = require('../config/database');

/**
 * Get all quizzes
 */
const getQuizzes = async (req, res) => {
  try {
    const { course_id, teacher_id, class_id } = req.query;
    const schoolId = req.user.school_id;

    let query = db('quizzes')
      .select(
        'quizzes.id',
        'quizzes.course_id',
        'quizzes.title',
        'quizzes.description',
        'quizzes.duration',
        'quizzes.total_questions',
        'quizzes.total_points',
        'quizzes.start_date',
        'quizzes.end_date',
        'quizzes.shuffle_questions',
        'quizzes.show_results_immediately',
        'quizzes.created_at',
        'quizzes.updated_at',
        'courses.name as course_name',
        'users.first_name as teacher_first_name',
        'users.last_name as teacher_last_name'
      )
      .join('courses', 'quizzes.course_id', 'courses.id')
      .join('teachers', 'quizzes.teacher_id', 'teachers.id')
      .join('users', 'teachers.user_id', 'users.id')
      .where('quizzes.school_id', schoolId);

    if (course_id) {
      query = query.where('quizzes.course_id', course_id);
    }

    if (teacher_id) {
      query = query.where('quizzes.teacher_id', teacher_id);
    }

    if (class_id) {
      // Filter quizzes by class through course
      query = query.where('courses.class_id', class_id);
    }

    const quizzes = await query.orderBy('quizzes.created_at', 'desc');

    res.json({
      success: true,
      data: quizzes
    });
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch quizzes'
    });
  }
};

/**
 * Get quiz by ID
 */
const getQuizById = async (req, res) => {
  try {
    const { id } = req.params;
    const schoolId = req.user.school_id;

    const quiz = await db('quizzes')
      .select(
        'quizzes.id',
        'quizzes.title',
        'quizzes.description',
        'quizzes.duration',
        'quizzes.total_questions',
        'quizzes.total_points',
        'quizzes.start_date',
        'quizzes.end_date',
        'quizzes.shuffle_questions',
        'quizzes.show_results_immediately',
        'quizzes.created_at',
        'quizzes.updated_at',
        'courses.name as course_name',
        'teachers.first_name as teacher_first_name',
        'teachers.last_name as teacher_last_name'
      )
      .join('courses', 'quizzes.course_id', 'courses.id')
      .join('teachers', 'quizzes.teacher_id', 'teachers.id')
      .where('quizzes.id', id)
      .where('quizzes.school_id', schoolId)
      .first();

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: 'Quiz not found'
      });
    }

    res.json({
      success: true,
      data: quiz
    });
  } catch (error) {
    console.error('Error fetching quiz:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch quiz'
    });
  }
};

/**
 * Create quiz
 */
const createQuiz = async (req, res) => {
  try {
    const { course_id, teacher_id, title, description, duration, total_questions, total_points, start_date, end_date, shuffle_questions, show_results_immediately } = req.body;
    const schoolId = req.user.school_id;

    const [quiz] = await db('quizzes')
      .insert({
        id: db.raw('gen_random_uuid()'),
        school_id: schoolId,
        course_id,
        teacher_id: teacher_id || req.user.id,
        title,
        description,
        duration,
        total_questions,
        total_points,
        start_date,
        end_date,
        shuffle_questions: shuffle_questions || false,
        show_results_immediately: show_results_immediately || false
      })
      .returning('*');

    res.status(201).json({
      success: true,
      data: quiz
    });
  } catch (error) {
    console.error('Error creating quiz:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create quiz'
    });
  }
};

/**
 * Update quiz
 */
const updateQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, duration, total_questions, total_points, start_date, end_date, shuffle_questions, show_results_immediately } = req.body;
    const schoolId = req.user.school_id;

    const [quiz] = await db('quizzes')
      .where({ id, school_id: schoolId })
      .update({
        title,
        description,
        duration,
        total_questions,
        total_points,
        start_date,
        end_date,
        shuffle_questions,
        show_results_immediately,
        updated_at: db.fn.now()
      })
      .returning('*');

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: 'Quiz not found'
      });
    }

    res.json({
      success: true,
      data: quiz
    });
  } catch (error) {
    console.error('Error updating quiz:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update quiz'
    });
  }
};

/**
 * Delete quiz
 */
const deleteQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const schoolId = req.user.school_id;

    const deleted = await db('quizzes')
      .where({ id, school_id: schoolId })
      .del();

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Quiz not found'
      });
    }

    res.json({
      success: true,
      message: 'Quiz deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting quiz:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete quiz'
    });
  }
};

/**
 * Record quiz score
 */
const recordQuizScore = async (req, res) => {
  try {
    const { student_id, quiz_id, score, percentage } = req.body;
    const schoolId = req.user.school_id;

    // Check if quiz exists
    const quiz = await db('quizzes')
      .where({ id: quiz_id, school_id: schoolId })
      .first();

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: 'Quiz not found'
      });
    }

    // Record the quiz attempt/score
    const [quizAttempt] = await db('quiz_attempts')
      .insert({
        id: db.raw('gen_random_uuid()'),
        student_id,
        quiz_id,
        score,
        percentage,
        attempted_at: db.fn.now()
      })
      .returning('*');

    res.status(201).json({
      success: true,
      data: quizAttempt
    });
  } catch (error) {
    console.error('Error recording quiz score:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to record quiz score'
    });
  }
};

/**
 * Get student quiz scores
 */
const getStudentQuizScores = async (req, res) => {
  try {
    const { student_id } = req.params;
    const schoolId = req.user.school_id;

    const scores = await db('quiz_attempts')
      .select(
        'quiz_attempts.id',
        'quiz_attempts.score',
        'quiz_attempts.percentage',
        'quiz_attempts.attempted_at',
        'quizzes.title as quiz_title',
        'quizzes.total_points',
        'courses.name as course_name'
      )
      .join('quizzes', 'quiz_attempts.quiz_id', 'quizzes.id')
      .join('courses', 'quizzes.course_id', 'courses.id')
      .where('quiz_attempts.student_id', student_id)
      .where('quizzes.school_id', schoolId)
      .orderBy('quiz_attempts.attempted_at', 'desc');

    res.json({
      success: true,
      data: scores
    });
  } catch (error) {
    console.error('Error fetching student quiz scores:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch student quiz scores'
    });
  }
};

module.exports = {
  getQuizzes,
  getQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  recordQuizScore,
  getStudentQuizScores
};
