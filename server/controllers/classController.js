const db = require('../config/database');
const { logAction } = require('../middleware/audit');

/**
 * Get all classes (school-scoped)
 */
const getClasses = async (req, res) => {
  try {
    const { grade_id, academic_year } = req.query;

    let query = db('classes')
      .select('classes.*')
      .select('grades.name as grade_name', 'grades.code as grade_code')
      .select('divisions.name as division_name', 'divisions.level as division_level')
      .select('users.first_name as homeroom_teacher_first_name', 'users.last_name as homeroom_teacher_last_name')
      .join('grades', 'classes.grade_id', 'grades.id')
      .join('divisions', 'grades.division_id', 'divisions.id')
      .leftJoin('users', 'classes.homeroom_teacher_id', 'users.id')
      .where('classes.school_id', req.user.school_id);

    if (grade_id) {
      query = query.where('classes.grade_id', grade_id);
    }

    if (academic_year) {
      query = query.where('classes.academic_year', academic_year);
    }

    const classes = await query.orderBy('divisions.level').orderBy('grades.order').orderBy('classes.name');

    res.json({ data: classes });
  } catch (error) {
    console.error('Get classes error:', error);
    res.status(500).json({ error: 'Failed to get classes' });
  }
};

/**
 * Get class by ID
 */
const getClassById = async (req, res) => {
  try {
    const { id } = req.params;

    const classData = await db('classes')
      .select('classes.*')
      .select('grades.name as grade_name', 'grades.code as grade_code')
      .select('divisions.name as division_name', 'divisions.level as division_level')
      .select('users.first_name as homeroom_teacher_first_name', 'users.last_name as homeroom_teacher_last_name')
      .join('grades', 'classes.grade_id', 'grades.id')
      .join('divisions', 'grades.division_id', 'divisions.id')
      .leftJoin('users', 'classes.homeroom_teacher_id', 'users.id')
      .where('classes.id', id)
      .where('classes.school_id', req.user.school_id)
      .first();

    if (!classData) {
      return res.status(404).json({ error: 'Class not found' });
    }

    // Get student count for the class
    const studentCount = await db('students')
      .where('class_id', id)
      .count('* as count')
      .first();

    res.json({ 
      data: {
        ...classData,
        student_count: parseInt(studentCount.count)
      }
    });
  } catch (error) {
    console.error('Get class error:', error);
    res.status(500).json({ error: 'Failed to get class' });
  }
};

/**
 * Create class (Super Admin/Principal only)
 */
const createClass = async (req, res) => {
  try {
    const { grade_id, name, homeroom_teacher_id, capacity, academic_year } = req.body;

    // Verify grade belongs to school
    const grade = await db('grades')
      .select('grades.*')
      .select('divisions.school_id')
      .join('divisions', 'grades.division_id', 'divisions.id')
      .where('grades.id', grade_id)
      .first();
    if (!grade || grade.school_id !== req.user.school_id) {
      return res.status(400).json({ error: 'Grade not found or does not belong to your school' });
    }

    // Verify teacher belongs to school if provided
    if (homeroom_teacher_id) {
      const teacher = await db('teachers')
        .select('teachers.*')
        .join('users', 'teachers.user_id', 'users.id')
        .where('teachers.id', homeroom_teacher_id)
        .where('teachers.school_id', req.user.school_id)
        .first();
      if (!teacher) {
        return res.status(400).json({ error: 'Teacher not found or does not belong to your school' });
      }
    }

    // Create class
    const [classId] = await db('classes').insert({
      school_id: req.user.school_id,
      grade_id,
      name,
      homeroom_teacher_id,
      capacity,
      academic_year: academic_year || '2024-2025'
    }).returning('id');

    // Log creation
    await logAction(req.user.school_id, req.user.id, 'create', 'class', classId, null, { name, grade_id }, req.ip, req.headers['user-agent']);

    res.status(201).json({
      message: 'Class created successfully',
      data: { id: classId, name }
    });
  } catch (error) {
    console.error('Create class error:', error);
    res.status(500).json({ error: 'Failed to create class' });
  }
};

/**
 * Update class
 */
const updateClass = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, homeroom_teacher_id, capacity, academic_year } = req.body;

    // Get old values
    const oldClass = await db('classes')
      .where('id', id)
      .where('school_id', req.user.school_id)
      .first();
    if (!oldClass) {
      return res.status(404).json({ error: 'Class not found' });
    }

    // Verify teacher belongs to school if provided
    if (homeroom_teacher_id) {
      const teacher = await db('teachers')
        .select('teachers.*')
        .join('users', 'teachers.user_id', 'users.id')
        .where('teachers.id', homeroom_teacher_id)
        .where('teachers.school_id', req.user.school_id)
        .first();
      if (!teacher) {
        return res.status(400).json({ error: 'Teacher not found or does not belong to your school' });
      }
    }

    // Update class
    await db('classes')
      .where('id', id)
      .where('school_id', req.user.school_id)
      .update({
        name,
        homeroom_teacher_id,
        capacity,
        academic_year,
        updated_at: new Date()
      });

    // Get updated class
    const classData = await db('classes').where('id', id).first();

    // Log update
    await logAction(req.user.school_id, req.user.id, 'update', 'class', id, oldClass, classData, req.ip, req.headers['user-agent']);

    res.json({
      message: 'Class updated successfully',
      data: classData
    });
  } catch (error) {
    console.error('Update class error:', error);
    res.status(500).json({ error: 'Failed to update class' });
  }
};

/**
 * Delete class (Super Admin only)
 */
const deleteClass = async (req, res) => {
  try {
    const { id } = req.params;

    // Get old values
    const oldClass = await db('classes')
      .where('id', id)
      .where('school_id', req.user.school_id)
      .first();
    if (!oldClass) {
      return res.status(404).json({ error: 'Class not found' });
    }

    // Check if class has students
    const studentCount = await db('students').where('class_id', id).count('* as count').first();
    if (parseInt(studentCount.count) > 0) {
      return res.status(400).json({ error: 'Cannot delete class with existing students' });
    }

    // Delete class
    await db('classes').where('id', id).where('school_id', req.user.school_id).del();

    // Log deletion
    await logAction(req.user.school_id, req.user.id, 'delete', 'class', id, oldClass, null, req.ip, req.headers['user-agent']);

    res.json({ message: 'Class deleted successfully' });
  } catch (error) {
    console.error('Delete class error:', error);
    res.status(500).json({ error: 'Failed to delete class' });
  }
};

/**
 * Get students in a class
 */
const getClassStudents = async (req, res) => {
  try {
    const { id } = req.params;

    // Verify class belongs to school
    const classData = await db('classes')
      .where('id', id)
      .where('school_id', req.user.school_id)
      .first();
    if (!classData) {
      return res.status(404).json({ error: 'Class not found' });
    }

    const students = await db('students')
      .select('students.*')
      .select('users.first_name', 'users.last_name', 'users.email')
      .leftJoin('users', 'students.user_id', 'users.id')
      .where('students.class_id', id)
      .where('students.school_id', req.user.school_id)
      .orderBy('students.last_name');

    res.json({ data: students });
  } catch (error) {
    console.error('Get class students error:', error);
    res.status(500).json({ error: 'Failed to get class students' });
  }
};

module.exports = {
  getClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
  getClassStudents
};
