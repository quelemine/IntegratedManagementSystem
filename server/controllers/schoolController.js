const db = require('../config/database');
const { logAction } = require('../middleware/audit');

/**
 * Get all schools (Super Admin only)
 */
const getSchools = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const offset = (page - 1) * limit;

    let query = db('schools');

    if (search) {
      query = query.where(function() {
        this.where('name', 'ilike', `%${search}%`)
          .orWhere('code', 'ilike', `%${search}%`);
      });
    }

    const schools = await query
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);

    const totalQuery = db('schools');
    if (search) {
      totalQuery.where(function() {
        this.where('name', 'ilike', `%${search}%`)
          .orWhere('code', 'ilike', `%${search}%`);
      });
    }
    const total = await totalQuery.count('* as count').first();

    res.json({
      data: schools,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(total.count),
        totalPages: Math.ceil(total.count / limit)
      }
    });
  } catch (error) {
    console.error('Get schools error:', error);
    res.status(500).json({ error: 'Failed to get schools' });
  }
};

/**
 * Get school by ID
 */
const getSchoolById = async (req, res) => {
  try {
    const { id } = req.params;

    const school = await db('schools').where('id', id).first();

    if (!school) {
      return res.status(404).json({ error: 'School not found' });
    }

    res.json({ data: school });
  } catch (error) {
    console.error('Get school error:', error);
    res.status(500).json({ error: 'Failed to get school' });
  }
};

/**
 * Create school (Super Admin only)
 */
const createSchool = async (req, res) => {
  try {
    const { name, code, address, phone, email, logo_url, primary_color, secondary_color, accent_color, settings } = req.body;

    // Check if code already exists
    const existingSchool = await db('schools').where('code', code).first();
    if (existingSchool) {
      return res.status(400).json({ error: 'School code already exists' });
    }

    // Create school
    const [schoolId] = await db('schools').insert({
      name,
      code,
      address,
      phone,
      email,
      logo_url,
      primary_color,
      secondary_color,
      accent_color,
      settings: settings ? JSON.stringify(settings) : null
    }).returning('id');

    // Log creation
    await logAction(schoolId, req.user.id, 'create', 'school', schoolId, null, { name, code }, req.ip, req.headers['user-agent']);

    res.status(201).json({
      message: 'School created successfully',
      data: { id: schoolId, name, code }
    });
  } catch (error) {
    console.error('Create school error:', error);
    res.status(500).json({ error: 'Failed to create school' });
  }
};

/**
 * Update school
 */
const updateSchool = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, address, phone, email, logo_url, primary_color, secondary_color, accent_color, settings } = req.body;

    // Get old values
    const oldSchool = await db('schools').where('id', id).first();
    if (!oldSchool) {
      return res.status(404).json({ error: 'School not found' });
    }

    // Update school
    await db('schools').where('id', id).update({
      name,
      address,
      phone,
      email,
      logo_url,
      primary_color,
      secondary_color,
      accent_color,
      settings: settings ? JSON.stringify(settings) : oldSchool.settings,
      updated_at: new Date()
    });

    // Get updated school
    const school = await db('schools').where('id', id).first();

    // Log update
    await logAction(school.id, req.user.id, 'update', 'school', id, oldSchool, school, req.ip, req.headers['user-agent']);

    res.json({
      message: 'School updated successfully',
      data: school
    });
  } catch (error) {
    console.error('Update school error:', error);
    res.status(500).json({ error: 'Failed to update school' });
  }
};

/**
 * Update school branding
 */
const updateSchoolBranding = async (req, res) => {
  try {
    const { id } = req.params;
    const { primary_color, secondary_color, accent_color, logo_url } = req.body;

    // Get old values
    const oldSchool = await db('schools').where('id', id).first();
    if (!oldSchool) {
      return res.status(404).json({ error: 'School not found' });
    }

    // Update branding
    await db('schools').where('id', id).update({
      primary_color,
      secondary_color,
      accent_color,
      logo_url,
      updated_at: new Date()
    });

    // Get updated school
    const school = await db('schools').where('id', id).first();

    // Log update
    await logAction(school.id, req.user.id, 'update', 'school', id, oldSchool, school, req.ip, req.headers['user-agent']);

    res.json({
      message: 'School branding updated successfully',
      data: {
        primary_color: school.primary_color,
        secondary_color: school.secondary_color,
        accent_color: school.accent_color,
        logo_url: school.logo_url
      }
    });
  } catch (error) {
    console.error('Update school branding error:', error);
    res.status(500).json({ error: 'Failed to update school branding' });
  }
};

/**
 * Delete school (Super Admin only)
 */
const deleteSchool = async (req, res) => {
  try {
    const { id } = req.params;

    // Get old values
    const oldSchool = await db('schools').where('id', id).first();
    if (!oldSchool) {
      return res.status(404).json({ error: 'School not found' });
    }

    // Check if school has users
    const userCount = await db('users').where('school_id', id).count('* as count').first();
    if (parseInt(userCount.count) > 0) {
      return res.status(400).json({ error: 'Cannot delete school with existing users' });
    }

    // Delete school
    await db('schools').where('id', id).del();

    // Log deletion
    await logAction(id, req.user.id, 'delete', 'school', id, oldSchool, null, req.ip, req.headers['user-agent']);

    res.json({ message: 'School deleted successfully' });
  } catch (error) {
    console.error('Delete school error:', error);
    res.status(500).json({ error: 'Failed to delete school' });
  }
};

/**
 * Get current user's school
 */
const getMySchool = async (req, res) => {
  try {
    const school = await db('schools').where('id', req.user.school_id).first();

    if (!school) {
      return res.status(404).json({ error: 'School not found' });
    }

    res.json({ data: school });
  } catch (error) {
    console.error('Get my school error:', error);
    res.status(500).json({ error: 'Failed to get school' });
  }
};

module.exports = {
  getSchools,
  getSchoolById,
  createSchool,
  updateSchool,
  updateSchoolBranding,
  deleteSchool,
  getMySchool
};
