const db = require('../config/database');

/**
 * Get all assignments
 */
const getAssignments = async (req, res) => {
  try {
    const { course_id, teacher_id, class_id } = req.query;
    const schoolId = req.user.school_id;

    let query = db('assignments')
      .select(
        'assignments.id',
        'assignments.course_id',
        'assignments.title',
        'assignments.description',
        'assignments.due_date',
        'assignments.total_points',
        'assignments.attachments',
        'assignments.created_at',
        'assignments.updated_at',
        'courses.name as course_name',
        'users.first_name as teacher_first_name',
        'users.last_name as teacher_last_name'
      )
      .join('courses', 'assignments.course_id', 'courses.id')
      .join('teachers', 'assignments.teacher_id', 'teachers.id')
      .join('users', 'teachers.user_id', 'users.id')
      .where('assignments.school_id', schoolId);

    if (course_id) {
      query = query.where('assignments.course_id', course_id);
    }

    if (teacher_id) {
      query = query.where('assignments.teacher_id', teacher_id);
    }

    if (class_id) {
      // Filter assignments by class through course
      query = query.where('courses.class_id', class_id);
    }

    const assignments = await query.orderBy('assignments.created_at', 'desc');

    res.json({
      success: true,
      data: assignments
    });
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch assignments'
    });
  }
};

/**
 * Get assignment by ID
 */
const getAssignmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const schoolId = req.user.school_id;

    const assignment = await db('assignments')
      .select(
        'assignments.id',
        'assignments.title',
        'assignments.description',
        'assignments.due_date',
        'assignments.total_points',
        'assignments.attachments',
        'assignments.created_at',
        'assignments.updated_at',
        'courses.name as course_name',
        'teachers.first_name as teacher_first_name',
        'teachers.last_name as teacher_last_name'
      )
      .join('courses', 'assignments.course_id', 'courses.id')
      .join('teachers', 'assignments.teacher_id', 'teachers.id')
      .where('assignments.id', id)
      .where('assignments.school_id', schoolId)
      .first();

    if (!assignment) {
      return res.status(404).json({
        success: false,
        error: 'Assignment not found'
      });
    }

    res.json({
      success: true,
      data: assignment
    });
  } catch (error) {
    console.error('Error fetching assignment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch assignment'
    });
  }
};

/**
 * Create assignment
 */
const createAssignment = async (req, res) => {
  try {
    const { course_id, teacher_id, title, description, due_date, total_points, attachments } = req.body;
    const schoolId = req.user.school_id;

    const [assignment] = await db('assignments')
      .insert({
        id: db.raw('gen_random_uuid()'),
        school_id: schoolId,
        course_id,
        teacher_id: teacher_id || req.user.id,
        title,
        description,
        due_date,
        total_points,
        attachments: attachments ? JSON.stringify(attachments) : null
      })
      .returning('*');

    res.status(201).json({
      success: true,
      data: assignment
    });
  } catch (error) {
    console.error('Error creating assignment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create assignment'
    });
  }
};

/**
 * Update assignment
 */
const updateAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, due_date, total_points, attachments } = req.body;
    const schoolId = req.user.school_id;

    const updateData = {
      title,
      description,
      due_date,
      total_points
    };

    if (attachments !== undefined) {
      updateData.attachments = attachments ? JSON.stringify(attachments) : null;
    }

    const [assignment] = await db('assignments')
      .where({ id, school_id: schoolId })
      .update({
        ...updateData,
        updated_at: db.fn.now()
      })
      .returning('*');

    if (!assignment) {
      return res.status(404).json({
        success: false,
        error: 'Assignment not found'
      });
    }

    res.json({
      success: true,
      data: assignment
    });
  } catch (error) {
    console.error('Error updating assignment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update assignment'
    });
  }
};

/**
 * Delete assignment
 */
const deleteAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const schoolId = req.user.school_id;

    const deleted = await db('assignments')
      .where({ id, school_id: schoolId })
      .del();

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Assignment not found'
      });
    }

    res.json({
      success: true,
      message: 'Assignment deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting assignment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete assignment'
    });
  }
};

module.exports = {
  getAssignments,
  getAssignmentById,
  createAssignment,
  updateAssignment,
  deleteAssignment
};
