require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const db = require('../config/database');

async function seedFinancialData() {
  try {
    console.log('Seeding Phase 3 Financial Features data...\n');

    // Get school ID
    const school = await db('schools').first('id');
    const schoolId = school.id;

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
    console.log('✓ Seeded fee categories');

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
    console.log('✓ Seeded tuition structures');

    // Get classes for class fees
    const classes = await db('classes').select('id', 'name').limit(5);
    const labFeeCategory = await db('fee_categories').where('name', 'Laboratory').first('id');
    const computerFeeCategory = await db('fee_categories').where('name', 'Computer Lab').first('id');

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
    console.log('✓ Seeded class fees');

    // Seed academic year fees
    const registrationCategory = await db('fee_categories').where('name', 'Registration').first('id');
    const booksCategory = await db('fee_categories').where('name', 'Books').first('id');

    await db('academic_year_fees').insert([
      {
        school_id: schoolId,
        fee_category_id: registrationCategory.id,
        amount: 10000,
        currency: 'LRD',
        academic_year: academicYear,
        student_category: 'new',
        is_active: true
      },
      {
        school_id: schoolId,
        fee_category_id: registrationCategory.id,
        amount: 5000,
        currency: 'LRD',
        academic_year: academicYear,
        student_category: 'returning',
        is_active: true
      },
      {
        school_id: schoolId,
        fee_category_id: booksCategory.id,
        amount: 15000,
        currency: 'LRD',
        academic_year: academicYear,
        student_category: null,
        is_active: true
      }
    ]);
    console.log('✓ Seeded academic year fees');

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
    console.log('✓ Seeded discounts');

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
    console.log('✓ Seeded scholarships');

    console.log('\n✓ All Phase 3 Financial Features seed data created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error.message);
    process.exit(1);
  }
}

seedFinancialData();
