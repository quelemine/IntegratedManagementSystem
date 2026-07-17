const db = require('../config/database');
const { logAction } = require('../middleware/audit');

/**
 * Get all grades (school-scoped)
 */
const getGrades = async (req, res) => {
  try {
    const { division_id } = req.query;

    let query = db('grades')
      .select('grades.*')
      .select('divisions.name as division_name', 'divisions.level as division_level')
      .join('divisions', 'grades.division_id', 'divisions.id')
      .where('divisions.school_id', req.user.school_id);

    if (division_id) {
      query = query.where('grades.division_id', division_id);
    }

    const grades = await query.orderBy('divisions.level').orderBy('grades.order');

    res.json({ data: grades });
  } catch (error) {
    console.error('Get grades error:', error);
    res.status(500).json({ error: 'Failed to get grades' });
  }
};

/**
 * Get grade by ID
 */
const getGradeById = async (req, res) => {
  try {
    const { id } = req.params;

    const grade = await db('grades')
      .select('grades.*')
      .select('divisions.name as division_name', 'divisions.level as division_level')
      .join('divisions', 'grades.division_id', 'divisions.id')
      .where('grades.id', id)
      .where('divisions.school_id', req.user.school_id)
      .first();

    if (!grade) {
      return res.status(404).json({ error: 'Grade not found' });
    }

    res.json({ data: grade });
  } catch (error) {
    console.error('Get grade error:', error);
    res.status(500).json({ error: 'Failed to get grade' });
  }
};

/**
 * Create grade (Super Admin/Principal only)
 */
const createGrade = async (req, res) => {
  try {
    const { division_id, name, code, order } = req.body;

    // Verify division belongs to school
    const division = await db('divisions')
      .where('id', division_id)
      .where('school_id', req.user.school_id)
      .first();
    if (!division) {
      return res.status(400).json({ error: 'Division not found or does not belong to your school' });
    }

    // Check if code already exists in division
    const existingGrade = await db('grades')
      .where('code', code)
      .where('division_id', division_id)
      .first();
    if (existingGrade) {
      return res.status(400).json({ error: 'Grade code already exists in this division' });
    }

    // Create grade
    const [gradeId] = await db('grades').insert({
      division_id,
      name,
      code,
      order
    }).returning('id');

    // Log creation
    await logAction(req.user.school_id, req.user.id, 'create', 'grade', gradeId, null, { name, code }, req.ip, req.headers['user-agent']);

    res.status(201).json({
      message: 'Grade created successfully',
      data: { id: gradeId, name, code }
    });
  } catch (error) {
    console.error('Create grade error:', error);
    res.status(500).json({ error: 'Failed to create grade' });
  }
};

/**
 * Update grade
 */
const updateGrade = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, order } = req.body;

    // Get old values
    const oldGrade = await db('grades')
      .select('grades.*')
      .select('divisions.school_id')
      .join('divisions', 'grades.division_id', 'divisions.id')
      .where('grades.id', id)
      .first();
    if (!oldGrade || oldGrade.school_id !== req.user.school_id) {
      return res.status(404).json({ error: 'Grade not found' });
    }

    // Update grade
    await db('grades').where('id', id).update({
      name,
      order
    });

    // Get updated grade
    const grade = await db('grades').where('id', id).first();

    // Log update
    await logAction(req.user.school_id, req.user.id, 'update', 'grade', id, oldGrade, grade, req.ip, req.headers['user-agent']);

    res.json({
      message: 'Grade updated successfully',
      data: grade
    });
  } catch (error) {
    console.error('Update grade error:', error);
    res.status(500).json({ error: 'Failed to update grade' });
  }
};

/**
 * Delete grade (Super Admin only)
 */
const deleteGrade = async (req, res) => {
  try {
    const { id } = req.params;

    // Get old values
    const oldGrade = await db('grades')
      .select('grades.*')
      .select('divisions.school_id')
      .join('divisions', 'grades.division_id', 'divisions.id')
      .where('grades.id', id)
      .first();
    if (!oldGrade || oldGrade.school_id !== req.user.school_id) {
      return res.status(404).json({ error: 'Grade not found' });
    }

    // Check if grade has classes
    const classCount = await db('classes').where('grade_id', id).count('* as count').first();
    if (parseInt(classCount.count) > 0) {
      return res.status(400).json({ error: 'Cannot delete grade with existing classes' });
    }

    // Delete grade
    await db('grades').where('id', id).del();

    // Log deletion
    await logAction(req.user.school_id, req.user.id, 'delete', 'grade', id, oldGrade, null, req.ip, req.headers['user-agent']);

    res.json({ message: 'Grade deleted successfully' });
  } catch (error) {
    console.error('Delete grade error:', error);
    res.status(500).json({ error: 'Failed to delete grade' });
  }
};

module.exports = {
  getGrades,
  getGradeById,
  createGrade,
  updateGrade,
  deleteGrade
};
