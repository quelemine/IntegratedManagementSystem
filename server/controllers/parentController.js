const db = require('../config/database');
const { logAction } = require('../middleware/audit');

/**
 * Validate email format
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

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
        'users.id as user_id',
        'users.first_name',
        'users.last_name',
        'users.email',
        'users.phone',
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
      .leftJoin('classes', 'students.class_id', 'classes.id')
      .leftJoin('grades', 'students.grade_id', 'grades.id')
      .select(
        'students.id',
        'students.student_id',
        'users.first_name',
        'users.last_name',
        'users.email',
        'classes.name as class_name',
        'grades.name as grade_name'
      )
      .where('parent_student_relationships.parent_id', parent.id);

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

/**
 * Bulk import parents from CSV
 */
const bulkImportParents = async (req, res) => {
  try {
    const { parents } = req.body;
    const schoolId = req.user.school_id;
    const userId = req.user.id;

    if (!parents || !Array.isArray(parents) || parents.length === 0) {
      return res.status(400).json({ success: false, error: 'No parents data provided' });
    }

    console.log('[BULK IMPORT] Importing', parents.length, 'parents');

    const results = {
      success: 0,
      failed: 0,
      errors: []
    };

    // Track duplicate emails across the import
    const emailSet = new Set();

    for (let i = 0; i < parents.length; i++) {
      const parentData = parents[i];
      const rowNumber = i + 2; // Row 1 is headers, so data starts at row 2

      try {
        // Validate required fields
        if (!parentData.first_name || !parentData.last_name || !parentData.email) {
          results.failed++;
          results.errors.push({
            row: rowNumber,
            parent: parentData,
            error: 'Missing required fields (first_name, last_name, email)'
          });
          continue;
        }

        // Validate email format
        if (!isValidEmail(parentData.email)) {
          results.failed++;
          results.errors.push({
            row: rowNumber,
            parent: parentData,
            error: 'Invalid email format'
          });
          continue;
        }

        // Check for duplicate emails within the import
        if (emailSet.has(parentData.email)) {
          results.failed++;
          results.errors.push({
            row: rowNumber,
            parent: parentData,
            error: 'Duplicate email within the import file'
          });
          continue;
        }
        emailSet.add(parentData.email);

        // Check if user already exists in database
        const existingUser = await db('users').where('email', parentData.email).first();
        if (existingUser) {
          results.failed++;
          results.errors.push({
            row: rowNumber,
            parent: parentData,
            error: 'User with this email already exists in the system'
          });
          continue;
        }

        // Get parent role
        const parentRole = await db('roles').where('name', 'parent').first();
        if (!parentRole) {
          results.failed++;
          results.errors.push({
            row: rowNumber,
            parent: parentData,
            error: 'Parent role not found'
          });
          continue;
        }

        // Create user
        const [user] = await db('users').insert({
          id: db.raw('gen_random_uuid()'),
          first_name: parentData.first_name,
          last_name: parentData.last_name,
          email: parentData.email,
          phone: parentData.phone || null,
          role_id: parentRole.id,
          role: 'parent',
          school_id: schoolId,
          is_active: true,
          created_at: db.raw('NOW()'),
          updated_at: db.raw('NOW()')
        }).returning('id');

        // Create parent
        await db('parents').insert({
          id: db.raw('gen_random_uuid()'),
          user_id: user.id,
          school_id: schoolId,
          relationship: parentData.relationship || null,
          occupation: parentData.occupation || null,
          employer: parentData.employer || null,
          phone: parentData.phone || null,
          address: parentData.address || null,
          status: 'active',
          created_at: db.raw('NOW()'),
          updated_at: db.raw('NOW()')
        });

        results.success++;
      } catch (error) {
        console.error('[BULK IMPORT] Error importing parent at row', rowNumber, ':', error);
        results.failed++;
        results.errors.push({
          row: rowNumber,
          parent: parentData,
          error: error.message
        });
      }
    }

    // Log bulk import action to audit logs
    await logAction(schoolId, userId, 'create', 'parent_bulk_import', null, null, 
      { total: parents.length, success: results.success, failed: results.failed }, 
      req.ip, req.headers['user-agent']);

    // Log to bulk_import_logs table
    await db('bulk_import_logs').insert({
      school_id: schoolId,
      user_id: userId,
      import_type: 'parent',
      total_records: parents.length,
      successful_records: results.success,
      failed_records: results.failed,
      error_summary: {
        total_errors: results.errors.length,
        error_types: results.errors.reduce((acc, err) => {
          acc[err.error] = (acc[err.error] || 0) + 1;
          return acc;
        }, {})
      },
      error_details: results.errors
    });

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('[BULK IMPORT] Error:', error);
    res.status(500).json({ success: false, error: 'Failed to bulk import parents' });
  }
};

module.exports = {
  getParents,
  getParentById,
  createParent,
  updateParent,
  deleteParent,
  getMyChildren,
  bulkImportParents
};
