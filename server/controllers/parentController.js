const db = require('../config/database');

/**
 * Get all parents (users with parent role and parent records)
 */
const getParents = async (req, res) => {
  try {
    const schoolId = req.user.school_id;

    const parents = await db('parents')
      .select(
        'parents.id as parent_record_id',
        'parents.id',
        'parents.relationship',
        'parents.occupation',
        'parents.employer',
        'parents.phone',
        'parents.address',
        'users.id as user_id',
        'users.first_name',
        'users.last_name',
        'users.email',
        'users.school_id'
      )
      .join('users', 'parents.user_id', 'users.id')
      .join('roles', 'users.role_id', 'roles.id')
      .where('roles.name', 'parent')
      .where('parents.school_id', schoolId)
      .where('users.is_active', true);

    res.json({
      success: true,
      data: parents
    });
  } catch (error) {
    console.error('Error fetching parents:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch parents'
    });
  }
};

/**
 * Get parent by ID
 */
const getParentById = async (req, res) => {
  try {
    const { id } = req.params;
    const schoolId = req.user.school_id;

    const parent = await db('parents')
      .select(
        'parents.*',
        'users.first_name',
        'users.last_name',
        'users.email'
      )
      .join('users', 'parents.user_id', 'users.id')
      .where('parents.id', id)
      .where('parents.school_id', schoolId)
      .first();

    if (!parent) {
      return res.status(404).json({
        success: false,
        error: 'Parent not found'
      });
    }

    res.json({
      success: true,
      data: parent
    });
  } catch (error) {
    console.error('Error fetching parent:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch parent'
    });
  }
};

/**
 * Create parent record
 */
const createParent = async (req, res) => {
  try {
    const { user_id, relationship, occupation, employer, phone, address } = req.body;
    const schoolId = req.user.school_id;

    // Verify user exists and has parent role
    const user = await db('users')
      .join('roles', 'users.role_id', 'roles.id')
      .where('users.id', user_id)
      .where('users.school_id', schoolId)
      .where('roles.name', 'parent')
      .first();

    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'User not found or does not have parent role'
      });
    }

    // Check if parent record already exists
    const existingParent = await db('parents')
      .where('user_id', user_id)
      .first();

    if (existingParent) {
      return res.status(400).json({
        success: false,
        error: 'Parent record already exists for this user'
      });
    }

    const [parent] = await db('parents')
      .insert({
        school_id: schoolId,
        user_id,
        relationship,
        occupation,
        employer,
        phone,
        address
      })
      .returning('*');

    res.status(201).json({
      success: true,
      data: parent
    });
  } catch (error) {
    console.error('Error creating parent:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create parent'
    });
  }
};

/**
 * Update parent
 */
const updateParent = async (req, res) => {
  try {
    const { id } = req.params;
    const { relationship, occupation, employer, phone, address } = req.body;
    const schoolId = req.user.school_id;

    const [parent] = await db('parents')
      .where('id', id)
      .where('school_id', schoolId)
      .update({
        relationship,
        occupation,
        employer,
        phone,
        address
      })
      .returning('*');

    if (!parent) {
      return res.status(404).json({
        success: false,
        error: 'Parent not found'
      });
    }

    res.json({
      success: true,
      data: parent
    });
  } catch (error) {
    console.error('Error updating parent:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update parent'
    });
  }
};

/**
 * Delete parent
 */
const deleteParent = async (req, res) => {
  try {
    const { id } = req.params;
    const schoolId = req.user.school_id;

    const deleted = await db('parents')
      .where('id', id)
      .where('school_id', schoolId)
      .del();

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Parent not found'
      });
    }

    res.json({
      success: true,
      message: 'Parent deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting parent:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete parent'
    });
  }
};

/**
 * Get parent's children (for logged-in parent)
 */
const getMyChildren = async (req, res) => {
  try {
    const userId = req.user.id;

    const parent = await db('parents').where('user_id', userId).first();
    if (!parent) {
      return res.status(404).json({
        success: false,
        error: 'Parent record not found'
      });
    }

    const children = await db('parent_student_relationships')
      .join('students', 'parent_student_relationships.student_id', 'students.id')
      .join('users', 'students.user_id', 'users.id')
      .leftJoin('student_classes', 'students.id', 'student_classes.student_id')
      .leftJoin('classes', 'student_classes.class_id', 'classes.id')
      .select(
        'students.id',
        'students.student_id',
        'users.first_name',
        'users.last_name',
        'users.email',
        'classes.name as class_name',
        'classes.division_name'
      )
      .where('parent_student_relationships.parent_id', parent.id)
      .where('students.is_active', true);

    res.json({
      success: true,
      data: children
    });
  } catch (error) {
    console.error('Error fetching children:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch children'
    });
  }
};

module.exports = {
  getParents,
  getParentById,
  createParent,
  updateParent,
  deleteParent,
  getMyChildren
};
