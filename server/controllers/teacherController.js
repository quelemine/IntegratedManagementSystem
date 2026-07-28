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
 * Get all teachers (users with teacher role and teacher records)
 */
const getTeachers = async (req, res) => {
  try {
    const schoolId = req.user.school_id;

    const teachers = await db('teachers')
      .select(
        'teachers.id as teacher_record_id',
        'teachers.id',
        'users.id as user_id',
        'users.first_name',
        'users.last_name',
        'users.email',
        'users.school_id'
      )
      .join('users', 'teachers.user_id', 'users.id')
      .join('roles', 'users.role_id', 'roles.id')
      .where('roles.name', 'teacher')
      .where('teachers.school_id', schoolId)
      .where('users.is_active', true);

    res.json({
      success: true,
      data: teachers
    });
  } catch (error) {
    console.error('Error fetching teachers:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch teachers'
    });
  }
};

/**
 * Bulk import teachers from CSV
 */
const bulkImportTeachers = async (req, res) => {
  try {
    const { teachers } = req.body;
    const schoolId = req.user.school_id;
    const userId = req.user.id;

    if (!teachers || !Array.isArray(teachers) || teachers.length === 0) {
      return res.status(400).json({ success: false, error: 'No teachers data provided' });
    }

    console.log('[BULK IMPORT] Importing', teachers.length, 'teachers');

    const results = {
      success: 0,
      failed: 0,
      errors: []
    };

    // Track duplicate emails across the import
    const emailSet = new Set();

    for (let i = 0; i < teachers.length; i++) {
      const teacherData = teachers[i];
      const rowNumber = i + 2; // Row 1 is headers, so data starts at row 2

      try {
        // Validate required fields
        if (!teacherData.first_name || !teacherData.last_name || !teacherData.email) {
          results.failed++;
          results.errors.push({
            row: rowNumber,
            teacher: teacherData,
            error: 'Missing required fields (first_name, last_name, email)'
          });
          continue;
        }

        // Validate email format
        if (!isValidEmail(teacherData.email)) {
          results.failed++;
          results.errors.push({
            row: rowNumber,
            teacher: teacherData,
            error: 'Invalid email format'
          });
          continue;
        }

        // Check for duplicate emails within the import
        if (emailSet.has(teacherData.email)) {
          results.failed++;
          results.errors.push({
            row: rowNumber,
            teacher: teacherData,
            error: 'Duplicate email within the import file'
          });
          continue;
        }
        emailSet.add(teacherData.email);

        // Check if user already exists in database
        const existingUser = await db('users').where('email', teacherData.email).first();
        if (existingUser) {
          results.failed++;
          results.errors.push({
            row: rowNumber,
            teacher: teacherData,
            error: 'User with this email already exists in the system'
          });
          continue;
        }

        // Get teacher role
        const teacherRole = await db('roles').where('name', 'teacher').first();
        if (!teacherRole) {
          results.failed++;
          results.errors.push({
            row: rowNumber,
            teacher: teacherData,
            error: 'Teacher role not found'
          });
          continue;
        }

        // Create user
        const [user] = await db('users').insert({
          id: db.raw('gen_random_uuid()'),
          first_name: teacherData.first_name,
          last_name: teacherData.last_name,
          email: teacherData.email,
          phone: teacherData.phone || null,
          role_id: teacherRole.id,
          role: 'teacher',
          school_id: schoolId,
          is_active: true,
          created_at: db.raw('NOW()'),
          updated_at: db.raw('NOW()')
        }).returning('id');

        // Create teacher
        await db('teachers').insert({
          id: db.raw('gen_random_uuid()'),
          user_id: user.id,
          school_id: schoolId,
          employee_id: teacherData.employee_id || null,
          subject_specialization: teacherData.subject_specialization || null,
          qualification: teacherData.qualification || null,
          experience_years: teacherData.experience_years || null,
          joining_date: teacherData.joining_date || null,
          address: teacherData.address || null,
          phone: teacherData.phone || null,
          emergency_contact_name: teacherData.emergency_contact_name || null,
          emergency_contact_phone: teacherData.emergency_contact_phone || null,
          status: 'active',
          created_at: db.raw('NOW()'),
          updated_at: db.raw('NOW()')
        });

        results.success++;
      } catch (error) {
        console.error('[BULK IMPORT] Error importing teacher at row', rowNumber, ':', error);
        results.failed++;
        results.errors.push({
          row: rowNumber,
          teacher: teacherData,
          error: error.message
        });
      }
    }

    // Log bulk import action to audit logs
    await logAction(schoolId, userId, 'create', 'teacher_bulk_import', null, null, 
      { total: teachers.length, success: results.success, failed: results.failed }, 
      req.ip, req.headers['user-agent']);

    // Log to bulk_import_logs table
    await db('bulk_import_logs').insert({
      school_id: schoolId,
      user_id: userId,
      import_type: 'teacher',
      total_records: teachers.length,
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
    res.status(500).json({ success: false, error: 'Failed to bulk import teachers' });
  }
};

module.exports = {
  getTeachers,
  bulkImportTeachers
};
