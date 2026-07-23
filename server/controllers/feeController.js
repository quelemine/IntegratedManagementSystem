const db = require('../config/database');

/**
 * Get all fee categories
 */
const getFeeCategories = async (req, res) => {
  try {
    const schoolId = req.user.school_id;

    const categories = await db('fee_categories')
      .where('school_id', schoolId)
      .where('is_active', true)
      .orderBy('name');

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching fee categories:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch fee categories'
    });
  }
};

/**
 * Create fee category
 */
const createFeeCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    const schoolId = req.user.school_id;

    const [category] = await db('fee_categories')
      .insert({
        school_id: schoolId,
        name,
        description,
        is_active: true
      })
      .returning('*');

    res.status(201).json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Error creating fee category:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create fee category'
    });
  }
};

/**
 * Get all tuition structures
 */
const getTuitionStructures = async (req, res) => {
  try {
    const { grade_id, academic_year } = req.query;
    const schoolId = req.user.school_id;

    let query = db('tuition_structures')
      .select(
        'tuition_structures.*',
        'grades.name as grade_name'
      )
      .join('grades', 'tuition_structures.grade_id', 'grades.id')
      .where('tuition_structures.school_id', schoolId)
      .where('tuition_structures.is_active', true);

    if (grade_id) {
      query = query.where('tuition_structures.grade_id', grade_id);
    }

    if (academic_year) {
      query = query.where('tuition_structures.academic_year', academic_year);
    }

    const structures = await query.orderBy('tuition_structures.academic_year', 'desc');

    res.json({
      success: true,
      data: structures
    });
  } catch (error) {
    console.error('Error fetching tuition structures:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch tuition structures'
    });
  }
};

/**
 * Create tuition structure
 */
const createTuitionStructure = async (req, res) => {
  try {
    const { grade_id, name, amount, currency, academic_year } = req.body;
    const schoolId = req.user.school_id;

    const [structure] = await db('tuition_structures')
      .insert({
        school_id: schoolId,
        grade_id,
        name,
        amount,
        currency: currency || 'LRD',
        academic_year,
        is_active: true
      })
      .returning('*');

    res.status(201).json({
      success: true,
      data: structure
    });
  } catch (error) {
    console.error('Error creating tuition structure:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create tuition structure'
    });
  }
};

/**
 * Get all class fees
 */
const getClassFees = async (req, res) => {
  try {
    const { class_id, academic_year } = req.query;
    const schoolId = req.user.school_id;

    let query = db('class_fees')
      .select(
        'class_fees.*',
        'classes.name as class_name',
        'fee_categories.name as fee_category_name'
      )
      .join('classes', 'class_fees.class_id', 'classes.id')
      .join('fee_categories', 'class_fees.fee_category_id', 'fee_categories.id')
      .where('class_fees.school_id', schoolId)
      .where('class_fees.is_active', true);

    if (class_id) {
      query = query.where('class_fees.class_id', class_id);
    }

    if (academic_year) {
      query = query.where('class_fees.academic_year', academic_year);
    }

    const fees = await query.orderBy('class_fees.academic_year', 'desc');

    res.json({
      success: true,
      data: fees
    });
  } catch (error) {
    console.error('Error fetching class fees:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch class fees'
    });
  }
};

/**
 * Create class fee
 */
const createClassFee = async (req, res) => {
  try {
    const { class_id, fee_category_id, amount, currency, academic_year } = req.body;
    const schoolId = req.user.school_id;

    const [fee] = await db('class_fees')
      .insert({
        school_id: schoolId,
        class_id,
        fee_category_id,
        amount,
        currency: currency || 'LRD',
        academic_year,
        is_active: true
      })
      .returning('*');

    res.status(201).json({
      success: true,
      data: fee
    });
  } catch (error) {
    console.error('Error creating class fee:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create class fee'
    });
  }
};

/**
 * Get all discounts
 */
const getDiscounts = async (req, res) => {
  try {
    const schoolId = req.user.school_id;

    const discounts = await db('discounts')
      .where('school_id', schoolId)
      .where('is_active', true)
      .orderBy('name');

    res.json({
      success: true,
      data: discounts
    });
  } catch (error) {
    console.error('Error fetching discounts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch discounts'
    });
  }
};

/**
 * Create discount
 */
const createDiscount = async (req, res) => {
  try {
    const { name, description, discount_type, discount_value, applicable_to, start_date, end_date } = req.body;
    const schoolId = req.user.school_id;

    const [discount] = await db('discounts')
      .insert({
        school_id: schoolId,
        name,
        description,
        discount_type,
        discount_value,
        applicable_to,
        start_date,
        end_date,
        is_active: true
      })
      .returning('*');

    res.status(201).json({
      success: true,
      data: discount
    });
  } catch (error) {
    console.error('Error creating discount:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create discount'
    });
  }
};

/**
 * Get all scholarships
 */
const getScholarships = async (req, res) => {
  try {
    const { academic_year } = req.query;
    const schoolId = req.user.school_id;

    let query = db('scholarships')
      .where('school_id', schoolId)
      .where('is_active', true);

    if (academic_year) {
      query = query.where('academic_year', academic_year);
    }

    const scholarships = await query.orderBy('name');

    res.json({
      success: true,
      data: scholarships
    });
  } catch (error) {
    console.error('Error fetching scholarships:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch scholarships'
    });
  }
};

/**
 * Create scholarship
 */
const createScholarship = async (req, res) => {
  try {
    const { name, description, scholarship_type, coverage_percentage, max_amount, academic_year } = req.body;
    const schoolId = req.user.school_id;

    const [scholarship] = await db('scholarships')
      .insert({
        school_id: schoolId,
        name,
        description,
        scholarship_type,
        coverage_percentage,
        max_amount,
        academic_year,
        is_active: true
      })
      .returning('*');

    res.status(201).json({
      success: true,
      data: scholarship
    });
  } catch (error) {
    console.error('Error creating scholarship:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create scholarship'
    });
  }
};

module.exports = {
  getFeeCategories,
  createFeeCategory,
  getTuitionStructures,
  createTuitionStructure,
  getClassFees,
  createClassFee,
  getDiscounts,
  createDiscount,
  getScholarships,
  createScholarship
};
