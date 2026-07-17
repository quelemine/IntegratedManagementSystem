const db = require('../config/database');
const { logAction } = require('../middleware/audit');

/**
 * Get all divisions (school-scoped)
 */
const getDivisions = async (req, res) => {
  try {
    const divisions = await db('divisions')
      .select('divisions.*')
      .select('users.first_name as principal_first_name', 'users.last_name as principal_last_name')
      .leftJoin('users', 'divisions.principal_id', 'users.id')
      .where('divisions.school_id', req.user.school_id)
      .orderBy('divisions.level');

    res.json({ data: divisions });
  } catch (error) {
    console.error('Get divisions error:', error);
    res.status(500).json({ error: 'Failed to get divisions' });
  }
};

/**
 * Get division by ID
 */
const getDivisionById = async (req, res) => {
  try {
    const { id } = req.params;

    const division = await db('divisions')
      .select('divisions.*')
      .select('users.first_name as principal_first_name', 'users.last_name as principal_last_name')
      .leftJoin('users', 'divisions.principal_id', 'users.id')
      .where('divisions.id', id)
      .where('divisions.school_id', req.user.school_id)
      .first();

    if (!division) {
      return res.status(404).json({ error: 'Division not found' });
    }

    res.json({ data: division });
  } catch (error) {
    console.error('Get division error:', error);
    res.status(500).json({ error: 'Failed to get division' });
  }
};

/**
 * Create division (Super Admin/Principal only)
 */
const createDivision = async (req, res) => {
  try {
    const { name, code, level, principal_id } = req.body;

    // Check if code already exists in school
    const existingDivision = await db('divisions')
      .where('code', code)
      .where('school_id', req.user.school_id)
      .first();
    if (existingDivision) {
      return res.status(400).json({ error: 'Division code already exists' });
    }

    // Create division
    const [divisionId] = await db('divisions').insert({
      school_id: req.user.school_id,
      name,
      code,
      level,
      principal_id
    }).returning('id');

    // Log creation
    await logAction(req.user.school_id, req.user.id, 'create', 'division', divisionId, null, { name, code }, req.ip, req.headers['user-agent']);

    res.status(201).json({
      message: 'Division created successfully',
      data: { id: divisionId, name, code }
    });
  } catch (error) {
    console.error('Create division error:', error);
    res.status(500).json({ error: 'Failed to create division' });
  }
};

/**
 * Update division
 */
const updateDivision = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, principal_id } = req.body;

    // Get old values
    const oldDivision = await db('divisions')
      .where('id', id)
      .where('school_id', req.user.school_id)
      .first();
    if (!oldDivision) {
      return res.status(404).json({ error: 'Division not found' });
    }

    // Update division
    await db('divisions')
      .where('id', id)
      .where('school_id', req.user.school_id)
      .update({
        name,
        principal_id,
        updated_at: new Date()
      });

    // Get updated division
    const division = await db('divisions').where('id', id).first();

    // Log update
    await logAction(req.user.school_id, req.user.id, 'update', 'division', id, oldDivision, division, req.ip, req.headers['user-agent']);

    res.json({
      message: 'Division updated successfully',
      data: division
    });
  } catch (error) {
    console.error('Update division error:', error);
    res.status(500).json({ error: 'Failed to update division' });
  }
};

/**
 * Delete division (Super Admin only)
 */
const deleteDivision = async (req, res) => {
  try {
    const { id } = req.params;

    // Get old values
    const oldDivision = await db('divisions')
      .where('id', id)
      .where('school_id', req.user.school_id)
      .first();
    if (!oldDivision) {
      return res.status(404).json({ error: 'Division not found' });
    }

    // Check if division has grades
    const gradeCount = await db('grades').where('division_id', id).count('* as count').first();
    if (parseInt(gradeCount.count) > 0) {
      return res.status(400).json({ error: 'Cannot delete division with existing grades' });
    }

    // Delete division
    await db('divisions').where('id', id).where('school_id', req.user.school_id).del();

    // Log deletion
    await logAction(req.user.school_id, req.user.id, 'delete', 'division', id, oldDivision, null, req.ip, req.headers['user-agent']);

    res.json({ message: 'Division deleted successfully' });
  } catch (error) {
    console.error('Delete division error:', error);
    res.status(500).json({ error: 'Failed to delete division' });
  }
};

module.exports = {
  getDivisions,
  getDivisionById,
  createDivision,
  updateDivision,
  deleteDivision
};
