const db = require('../config/database');

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

module.exports = {
  getTeachers
};
