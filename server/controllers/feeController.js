const db = require('../config/database');

/**
 * Seed financial data (fee categories, tuition structures, class fees, discounts, scholarships)
 */
const seedFinancialData = async (req, res) => {
  try {
    const schoolId = req.user.school_id;

    // Check if data already exists
    const existingCategories = await db('fee_categories').where('school_id', schoolId).first();
    if (existingCategories) {
      return res.json({
        success: true,
        message: 'Financial data already exists',
        data: null
      });
    }

    // Seed fee categories
    const feeCategories = [
      { name: 'Tuition', description: 'Regular tuition fees' },
      { name: 'Registration', description: 'Annual registration fee' },
      { name: 'Library', description: 'Library access fee' },
      { name: 'Laboratory', description: 'Science lab fee' },
      { name: 'Computer Lab', description: 'Computer lab fee' },
      { name: 'Sports', description: 'Sports and athletics fee' },
      { name: 'Transportation', description: 'School bus fee' },
      { name: 'Books', description: 'Textbook fee' },
      { name: 'Uniform', description: 'School uniform fee' },
      { name: 'Examination', description: 'Examination fee' }
    ];

    for (const category of feeCategories) {
      await db('fee_categories').insert({
        school_id: schoolId,
        name: category.name,
        description: category.description,
        is_active: true
      });
    }

    // Get grades for tuition structures
    const grades = await db('grades').select('id', 'name');

    // Seed tuition structures for each grade
    const academicYear = '2024-2025';
    for (const grade of grades) {
      const baseAmount = grade.name.includes('12') ? 50000 :
                         grade.name.includes('11') ? 45000 :
                         grade.name.includes('10') ? 40000 :
                         grade.name.includes('9') ? 35000 :
                         grade.name.includes('8') ? 30000 :
                         grade.name.includes('7') ? 25000 : 20000;

      await db('tuition_structures').insert({
        school_id: schoolId,
        grade_id: grade.id,
        name: `${grade.name} Grade Tuition`,
        amount: baseAmount,
        currency: 'LRD',
        academic_year: academicYear,
        is_active: true
      });
    }

    // Get classes for class fees
    const classes = await db('classes').select('id', 'name').limit(5);
    const labFeeCategory = await db('fee_categories').where('name', 'Laboratory').first('id');
    const computerFeeCategory = await db('fee_categories').where('name', 'Computer Lab').first('id');

    if (classes.length > 0 && labFeeCategory && computerFeeCategory) {
      for (const classRecord of classes) {
        await db('class_fees').insert({
          school_id: schoolId,
          class_id: classRecord.id,
          fee_category_id: labFeeCategory.id,
          amount: 5000,
          currency: 'LRD',
          academic_year: academicYear,
          is_active: true
        });

        await db('class_fees').insert({
          school_id: schoolId,
          class_id: classRecord.id,
          fee_category_id: computerFeeCategory.id,
          amount: 3000,
          currency: 'LRD',
          academic_year: academicYear,
          is_active: true
        });
      }
    }

    // Seed discounts
    await db('discounts').insert([
      {
        school_id: schoolId,
        name: 'Early Payment Discount',
        description: '10% discount for payments made before August 31st',
        discount_type: 'percentage',
        discount_value: 10,
        applicable_to: 'tuition',
        start_date: `${academicYear.split('-')[0]}-07-01`,
        end_date: `${academicYear.split('-')[0]}-08-31`,
        is_active: true
      },
      {
        school_id: schoolId,
        name: 'Sibling Discount',
        description: '15% discount for second and subsequent children',
        discount_type: 'percentage',
        discount_value: 15,
        applicable_to: 'all',
        start_date: null,
        end_date: null,
        is_active: true
      },
      {
        school_id: schoolId,
        name: 'Full Payment Discount',
        description: '5% discount for paying full year tuition upfront',
        discount_type: 'percentage',
        discount_value: 5,
        applicable_to: 'tuition',
        start_date: null,
        end_date: null,
        is_active: true
      }
    ]);

    // Seed scholarships
    await db('scholarships').insert([
      {
        school_id: schoolId,
        name: 'Academic Excellence Scholarship',
        description: 'For students with outstanding academic performance',
        scholarship_type: 'merit',
        coverage_percentage: 50,
        max_amount: 25000,
        academic_year: academicYear,
        is_active: true
      },
      {
        school_id: schoolId,
        name: 'Financial Aid Scholarship',
        description: 'For students from low-income families',
        scholarship_type: 'need',
        coverage_percentage: 75,
        max_amount: 37500,
        academic_year: academicYear,
        is_active: true
      },
      {
        school_id: schoolId,
        name: 'Sports Scholarship',
        description: 'For talented athletes',
        scholarship_type: 'athletic',
        coverage_percentage: 40,
        max_amount: 20000,
        academic_year: academicYear,
        is_active: true
      }
    ]);

    res.json({
      success: true,
      message: 'Financial data seeded successfully',
      data: null
    });
  } catch (error) {
    console.error('Error seeding financial data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to seed financial data'
    });
  }
};

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
  seedFinancialData,
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
