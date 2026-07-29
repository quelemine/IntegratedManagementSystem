const db = require('../config/database');
const { logAction } = require('../middleware/audit');

/**
 * Get all parent-student relationships
 */
const getRelationships = async (req, res) => {
  try {
    const schoolId = req.user.school_id;
    const { parent_id, student_id } = req.query;

    let query = db('parent_student_relationships as psr')
      .select(
        'psr.id',
        'psr.parent_id',
        'psr.student_id',
        'psr.relationship_type',
        'psr.is_primary',
        'psr.created_at',
        'parents.first_name as parent_first_name',
        'parents.last_name as parent_last_name',
        'parents.email as parent_email',
        'students.student_id as student_student_id',
        'students.first_name as student_first_name',
        'students.last_name as student_last_name'
      )
      .join('parents', 'psr.parent_id', 'parents.id')
      .join('students', 'psr.student_id', 'students.id')
      .where('parents.school_id', schoolId);

    if (parent_id) {
      query = query.where('psr.parent_id', parent_id);
    }
    if (student_id) {
      query = query.where('psr.student_id', student_id);
    }

    const relationships = await query.orderBy('psr.created_at', 'desc');

    res.json({
      success: true,
      data: relationships
    });
  } catch (error) {
    console.error('Error fetching relationships:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch relationships' });
  }
};

/**
 * Create a parent-student relationship
 */
const createRelationship = async (req, res) => {
  try {
    const { parent_id, student_id, relationship_type, is_primary } = req.body;
    const schoolId = req.user.school_id;
    const userId = req.user.id;

    // Validate required fields
    if (!parent_id || !student_id) {
      return res.status(400).json({ success: false, error: 'parent_id and student_id are required' });
    }

    // Validate relationship_type
    const validRelationshipTypes = ['father', 'mother', 'guardian', 'other'];
    if (relationship_type && !validRelationshipTypes.includes(relationship_type.toLowerCase())) {
      return res.status(400).json({ success: false, error: 'Invalid relationship_type. Must be: father, mother, guardian, or other' });
    }

    // Check if parent exists in the same school
    const parent = await db('parents').where('id', parent_id).where('school_id', schoolId).first();
    if (!parent) {
      return res.status(404).json({ success: false, error: 'Parent not found' });
    }

    // Check if student exists in the same school
    const student = await db('students').where('id', student_id).where('school_id', schoolId).first();
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }

    // Check if relationship already exists
    const existingRelationship = await db('parent_student_relationships')
      .where('parent_id', parent_id)
      .where('student_id', student_id)
      .first();
    if (existingRelationship) {
      return res.status(400).json({ success: false, error: 'Relationship already exists' });
    }

    // If setting as primary, remove primary flag from other relationships for this student
    if (is_primary) {
      await db('parent_student_relationships')
        .where('student_id', student_id)
        .update({ is_primary: false });
    }

    // Create relationship
    const [relationship] = await db('parent_student_relationships').insert({
      id: db.raw('gen_random_uuid()'),
      parent_id,
      student_id,
      relationship_type: relationship_type || 'guardian',
      is_primary: is_primary || false,
      created_at: db.raw('NOW()')
    }).returning('*');

    // Log action
    await logAction(schoolId, userId, 'create', 'parent_student_relationship', null, null,
      { parent_id, student_id, relationship_type: relationship_type || 'guardian' },
      req.ip, req.headers['user-agent']);

    res.json({
      success: true,
      data: relationship
    });
  } catch (error) {
    console.error('Error creating relationship:', error);
    res.status(500).json({ success: false, error: 'Failed to create relationship' });
  }
};

/**
 * Update a parent-student relationship
 */
const updateRelationship = async (req, res) => {
  try {
    const { id } = req.params;
    const { relationship_type, is_primary } = req.body;
    const schoolId = req.user.school_id;
    const userId = req.user.id;

    // Validate relationship_type
    const validRelationshipTypes = ['father', 'mother', 'guardian', 'other'];
    if (relationship_type && !validRelationshipTypes.includes(relationship_type.toLowerCase())) {
      return res.status(400).json({ success: false, error: 'Invalid relationship_type. Must be: father, mother, guardian, or other' });
    }

    // Get existing relationship
    const relationship = await db('parent_student_relationships').where('id', id).first();
    if (!relationship) {
      return res.status(404).json({ success: false, error: 'Relationship not found' });
    }

    // Verify the relationship belongs to the same school
    const parent = await db('parents').where('id', relationship.parent_id).where('school_id', schoolId).first();
    if (!parent) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    // If setting as primary, remove primary flag from other relationships for this student
    if (is_primary && !relationship.is_primary) {
      await db('parent_student_relationships')
        .where('student_id', relationship.student_id)
        .whereNot('id', id)
        .update({ is_primary: false });
    }

    // Update relationship
    const updateData = {};
    if (relationship_type !== undefined) updateData.relationship_type = relationship_type;
    if (is_primary !== undefined) updateData.is_primary = is_primary;

    const [updated] = await db('parent_student_relationships')
      .where('id', id)
      .update(updateData)
      .returning('*');

    // Log action
    await logAction(schoolId, userId, 'update', 'parent_student_relationship', id, relationship,
      updateData,
      req.ip, req.headers['user-agent']);

    res.json({
      success: true,
      data: updated
    });
  } catch (error) {
    console.error('Error updating relationship:', error);
    res.status(500).json({ success: false, error: 'Failed to update relationship' });
  }
};

/**
 * Delete a parent-student relationship
 */
const deleteRelationship = async (req, res) => {
  try {
    const { id } = req.params;
    const schoolId = req.user.school_id;
    const userId = req.user.id;

    // Get existing relationship
    const relationship = await db('parent_student_relationships').where('id', id).first();
    if (!relationship) {
      return res.status(404).json({ success: false, error: 'Relationship not found' });
    }

    // Verify the relationship belongs to the same school
    const parent = await db('parents').where('id', relationship.parent_id).where('school_id', schoolId).first();
    if (!parent) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    // Delete relationship
    await db('parent_student_relationships').where('id', id).del();

    // Log action
    await logAction(schoolId, userId, 'delete', 'parent_student_relationship', id, relationship, null,
      req.ip, req.headers['user-agent']);

    res.json({
      success: true,
      message: 'Relationship deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting relationship:', error);
    res.status(500).json({ success: false, error: 'Failed to delete relationship' });
  }
};

/**
 * Get children for a parent (with security check)
 */
const getParentChildren = async (req, res) => {
  try {
    const userId = req.user.id;
    const schoolId = req.user.school_id;

    console.log('[PARENT CHILDREN] Request received');
    console.log('[PARENT CHILDREN] User ID:', userId);
    console.log('[PARENT CHILDREN] School ID:', schoolId);

    // Get parent record for the user
    const parent = await db('parents').where('user_id', userId).where('school_id', schoolId).first();
    if (!parent) {
      console.log('[PARENT CHILDREN] Parent record not found');
      return res.status(404).json({ success: false, error: 'Parent record not found' });
    }

    console.log('[PARENT CHILDREN] Parent found:', parent.id);

    // Get children through relationships
    const children = await db('parent_student_relationships as psr')
      .select(
        'students.id',
        'students.student_id',
        'users.first_name',
        'users.last_name',
        'students.date_of_birth',
        'students.gender',
        'students.address',
        'users.phone',
        'students.class_id',
        'students.grade_id',
        'students.division_id',
        'students.status',
        'psr.relationship_type',
        'psr.is_primary',
        'classes.name as class_name',
        'grades.name as grade_name',
        'divisions.name as division_name'
      )
      .join('students', 'psr.student_id', 'students.id')
      .leftJoin('users', 'students.user_id', 'users.id')
      .leftJoin('classes', 'students.class_id', 'classes.id')
      .leftJoin('grades', 'students.grade_id', 'grades.id')
      .leftJoin('divisions', 'students.division_id', 'divisions.id')
      .where('psr.parent_id', parent.id)
      .where('students.school_id', schoolId)
      .orderBy('psr.is_primary', 'desc')
      .orderBy('users.last_name', 'asc');

    console.log('[PARENT CHILDREN] Children found:', children.length);

    res.json({
      success: true,
      data: children
    });
  } catch (error) {
    console.error('[PARENT CHILDREN] Error:', error);
    console.error('[PARENT CHILDREN] Error stack:', error.stack);
    res.status(500).json({ success: false, error: 'Failed to fetch children' });
  }
};

/**
 * Get parents for a student (with security check)
 */
const getStudentParents = async (req, res) => {
  try {
    const { studentId } = req.params;
    const schoolId = req.user.school_id;

    // Verify student exists and belongs to the same school
    const student = await db('students').where('id', studentId).where('school_id', schoolId).first();
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }

    // Get parents through relationships
    const parents = await db('parent_student_relationships as psr')
      .select(
        'parents.id',
        'parents.user_id',
        'parents.relationship',
        'parents.occupation',
        'parents.employer',
        'parents.phone',
        'parents.address',
        'psr.relationship_type as relationship_type',
        'psr.is_primary',
        'users.first_name',
        'users.last_name',
        'users.email'
      )
      .join('parents', 'psr.parent_id', 'parents.id')
      .join('users', 'parents.user_id', 'users.id')
      .where('psr.student_id', studentId)
      .where('parents.school_id', schoolId)
      .orderBy('psr.is_primary', 'desc')
      .orderBy('parents.last_name', 'asc');

    res.json({
      success: true,
      data: parents
    });
  } catch (error) {
    console.error('Error fetching student parents:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch parents' });
  }
};

module.exports = {
  getRelationships,
  createRelationship,
  updateRelationship,
  deleteRelationship,
  getParentChildren,
  getStudentParents
};
