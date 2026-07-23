const db = require('../config/database');
const { logAction } = require('../middleware/audit');
const { generateIDCardPDF, generateCardNumber } = require('../utils/idCardGenerator');
const path = require('path');
const fs = require('fs');

/**
 * Get all students (school-scoped)
 */
const getStudents = async (req, res) => {
  try {
    const { page = 1, limit = 20, class_id, grade_id, division_id, search } = req.query;
    const offset = (page - 1) * limit;

    let query = db('students')
      .select('students.*')
      .select('users.first_name', 'users.last_name', 'users.email', 'users.phone')
      .select('classes.name as class_name')
      .select('grades.name as grade_name', 'grades.code as grade_code')
      .select('divisions.name as division_name', 'divisions.level as division_level')
      .leftJoin('users', 'students.user_id', 'users.id')
      .leftJoin('classes', 'students.class_id', 'classes.id')
      .leftJoin('grades', 'students.grade_id', 'grades.id')
      .leftJoin('divisions', 'students.division_id', 'divisions.id')
      .where('students.school_id', req.user.school_id);

    if (class_id) {
      query = query.where('students.class_id', class_id);
    }

    if (grade_id) {
      query = query.where('students.grade_id', grade_id);
    }

    if (division_id) {
      query = query.where('students.division_id', division_id);
    }

    if (search) {
      query = query.where(function() {
        this.where('students.student_id', 'ilike', `%${search}%`)
          .orWhere('users.first_name', 'ilike', `%${search}%`)
          .orWhere('users.last_name', 'ilike', `%${search}%`);
      });
    }

    const students = await query
      .orderBy('users.last_name')
      .limit(limit)
      .offset(offset);

    const totalQuery = db('students')
      .leftJoin('users', 'students.user_id', 'users.id')
      .where('students.school_id', req.user.school_id)
      .modify(function(q) {
        if (class_id) q.where('students.class_id', class_id);
        if (grade_id) q.where('students.grade_id', grade_id);
        if (division_id) q.where('students.division_id', division_id);
        if (search) {
          q.where(function() {
            this.where('students.student_id', 'ilike', `%${search}%`)
              .orWhere('users.first_name', 'ilike', `%${search}%`)
              .orWhere('users.last_name', 'ilike', `%${search}%`);
          });
        }
      });
    const total = await totalQuery.count('* as count').first();

    res.json({
      data: students,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(total.count),
        totalPages: Math.ceil(total.count / limit)
      }
    });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ error: 'Failed to get students' });
  }
};

/**
 * Get student by ID
 */
const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await db('students')
      .select('students.*')
      .select('users.first_name', 'users.last_name', 'users.email', 'users.phone', 'users.profile_image')
      .select('classes.name as class_name', 'classes.capacity as class_capacity')
      .select('grades.name as grade_name', 'grades.code as grade_code')
      .select('divisions.name as division_name', 'divisions.level as division_level')
      .leftJoin('users', 'students.user_id', 'users.id')
      .leftJoin('classes', 'students.class_id', 'classes.id')
      .leftJoin('grades', 'students.grade_id', 'grades.id')
      .leftJoin('divisions', 'students.division_id', 'divisions.id')
      .where('students.id', id)
      .where('students.school_id', req.user.school_id)
      .first();

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Get parents
    const parents = await db('parents')
      .select('parents.*')
      .select('users.first_name as parent_first_name', 'users.last_name as parent_last_name', 'users.email as parent_email', 'users.phone as parent_phone')
      .join('users', 'parents.user_id', 'users.id')
      .join('parent_student_relationships', 'parents.id', 'parent_student_relationships.parent_id')
      .where('parent_student_relationships.student_id', id);

    res.json({ 
      data: {
        ...student,
        parents
      }
    });
  } catch (error) {
    console.error('Get student error:', error);
    res.status(500).json({ error: 'Failed to get student' });
  }
};

/**
 * Create student
 */
const createStudent = async (req, res) => {
  try {
    const { user_id, student_id, class_id, grade_id, division_id, date_of_birth, gender, address, enrollment_date, photo_url, emergency_contact_name, emergency_contact_phone, medical_info } = req.body;

    // Check if student_id already exists
    const existingStudent = await db('students')
      .where('student_id', student_id)
      .where('school_id', req.user.school_id)
      .first();
    if (existingStudent) {
      return res.status(400).json({ error: 'Student ID already exists' });
    }

    // Verify class/grade/division belong to school
    if (class_id) {
      const classData = await db('classes')
        .select('classes.*')
        .select('grades.division_id')
        .join('grades', 'classes.grade_id', 'grades.id')
        .where('classes.id', class_id)
        .where('classes.school_id', req.user.school_id)
        .first();
      if (!classData) {
        return res.status(400).json({ error: 'Class not found or does not belong to your school' });
      }
      division_id = division_id || classData.division_id;
      grade_id = grade_id || classData.grade_id;
    }

    // Create student
    const [studentId] = await db('students').insert({
      school_id: req.user.school_id,
      user_id,
      student_id,
      class_id,
      grade_id,
      division_id,
      date_of_birth,
      gender,
      address,
      enrollment_date: enrollment_date || new Date().toISOString().split('T')[0],
      photo_url,
      emergency_contact_name,
      emergency_contact_phone,
      medical_info,
      status: 'active'
    }).returning('id');

    // Log creation
    await logAction(req.user.school_id, req.user.id, 'create', 'student', studentId, null, { student_id }, req.ip, req.headers['user-agent']);

    res.status(201).json({
      message: 'Student created successfully',
      data: { id: studentId, student_id }
    });
  } catch (error) {
    console.error('Create student error:', error);
    res.status(500).json({ error: 'Failed to create student' });
  }
};

/**
 * Update student
 */
const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { class_id, grade_id, division_id, date_of_birth, gender, address, photo_url, emergency_contact_name, emergency_contact_phone, medical_info, status } = req.body;

    // Get old values
    const oldStudent = await db('students')
      .where('id', id)
      .where('school_id', req.user.school_id)
      .first();
    if (!oldStudent) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Verify class/grade/division belong to school if provided
    if (class_id) {
      const classData = await db('classes')
        .where('id', class_id)
        .where('school_id', req.user.school_id)
        .first();
      if (!classData) {
        return res.status(400).json({ error: 'Class not found or does not belong to your school' });
      }
    }

    // Update student
    await db('students')
      .where('id', id)
      .where('school_id', req.user.school_id)
      .update({
        class_id,
        grade_id,
        division_id,
        date_of_birth,
        gender,
        address,
        photo_url,
        emergency_contact_name,
        emergency_contact_phone,
        medical_info,
        status,
        updated_at: new Date()
      });

    // Get updated student
    const student = await db('students').where('id', id).first();

    // Log update
    await logAction(req.user.school_id, req.user.id, 'update', 'student', id, oldStudent, student, req.ip, req.headers['user-agent']);

    res.json({
      message: 'Student updated successfully',
      data: student
    });
  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({ error: 'Failed to update student' });
  }
};

/**
 * Delete student (soft delete - set status to inactive)
 */
const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;

    // Get old values
    const oldStudent = await db('students')
      .where('id', id)
      .where('school_id', req.user.school_id)
      .first();
    if (!oldStudent) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Soft delete
    await db('students')
      .where('id', id)
      .where('school_id', req.user.school_id)
      .update({
        status: 'inactive',
        updated_at: new Date()
      });

    // Log deletion
    await logAction(req.user.school_id, req.user.id, 'delete', 'student', id, oldStudent, null, req.ip, req.headers['user-agent']);

    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({ error: 'Failed to delete student' });
  }
};

/**
 * Get current student's profile (for students)
 */
const getMyProfile = async (req, res) => {
  try {
    const student = await db('students')
      .select('students.*')
      .select('users.first_name', 'users.last_name', 'users.email', 'users.phone', 'users.profile_image')
      .select('classes.name as class_name')
      .select('grades.name as grade_name')
      .select('divisions.name as division_name')
      .leftJoin('users', 'students.user_id', 'users.id')
      .leftJoin('classes', 'students.class_id', 'classes.id')
      .leftJoin('grades', 'students.grade_id', 'grades.id')
      .leftJoin('divisions', 'students.division_id', 'divisions.id')
      .where('students.user_id', req.user.id)
      .first();

    if (!student) {
      return res.status(404).json({ error: 'Student profile not found' });
    }

    res.json({ data: student });
  } catch (error) {
    console.error('Get my profile error:', error);
    res.status(500).json({ error: 'Failed to get student profile' });
  }
};

/**
 * Generate ID card for student
 */
const generateIDCard = async (req, res) => {
  try {
    const { id } = req.params;

    // Get student with all details
    const student = await db('students')
      .select('students.*')
      .select('users.first_name', 'users.last_name')
      .select('grades.name as grade_name')
      .select('divisions.name as division_name')
      .leftJoin('users', 'students.user_id', 'users.id')
      .leftJoin('grades', 'students.grade_id', 'grades.id')
      .leftJoin('divisions', 'students.division_id', 'divisions.id')
      .where('students.id', id)
      .where('students.school_id', req.user.school_id)
      .first();

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Get school details
    const school = await db('schools').where('id', req.user.school_id).first();
    if (!school) {
      return res.status(404).json({ error: 'School not found' });
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'uploads', 'id-cards');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Generate card number
    const cardNumber = generateCardNumber(student.student_id, school.code);

    // Check if ID card already exists
    const existingCard = await db('student_id_cards')
      .where('student_id', id)
      .where('status', 'active')
      .first();

    let cardId;
    let pdfPath;

    if (existingCard) {
      cardId = existingCard.id;
      pdfPath = existingCard.qr_code_image_url;
    } else {
      // Generate PDF
      pdfPath = path.join('uploads', 'id-cards', `${student.student_id}-id-card.pdf`);
      const fullPath = path.join(process.cwd(), pdfPath);

      await generateIDCardPDF(student, school, fullPath);

      // Create ID card record
      const [newCardId] = await db('student_id_cards').insert({
        school_id: req.user.school_id,
        student_id: id,
        card_number: cardNumber,
        qr_code_data: JSON.stringify({
          student_id: student.student_id,
          school_id: req.user.school_id,
          name: `${student.first_name} ${student.last_name}`,
          grade: student.grade_name
        }),
        qr_code_image_url: pdfPath,
        issue_date: new Date().toISOString().split('T')[0],
        expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'active',
        generated_by: req.user.id
      }).returning('id');

      cardId = newCardId;

      // Log ID card generation
      await logAction(req.user.school_id, req.user.id, 'create', 'student_id_card', cardId, null, { card_number }, req.ip, req.headers['user-agent']);
    }

    res.json({
      message: 'ID card generated successfully',
      data: {
        card_id: cardId,
        card_number: existingCard ? existingCard.card_number : cardNumber,
        pdf_url: pdfPath,
        issue_date: existingCard ? existingCard.issue_date : new Date().toISOString().split('T')[0],
        expiry_date: existingCard ? existingCard.expiry_date : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }
    });
  } catch (error) {
    console.error('Generate ID card error:', error);
    res.status(500).json({ error: 'Failed to generate ID card' });
  }
};

/**
 * Download ID card PDF
 */
const downloadIDCard = async (req, res) => {
  try {
    const { id } = req.params;

    // Get student
    const student = await db('students')
      .where('id', id)
      .where('school_id', req.user.school_id)
      .first();

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Get ID card
    const idCard = await db('student_id_cards')
      .where('student_id', id)
      .where('status', 'active')
      .first();

    if (!idCard) {
      return res.status(404).json({ error: 'ID card not found. Please generate ID card first.' });
    }

    const filePath = path.join(process.cwd(), idCard.qr_code_image_url);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'ID card file not found' });
    }

    res.download(filePath, `${student.student_id}-id-card.pdf`);
  } catch (error) {
    console.error('Download ID card error:', error);
    res.status(500).json({ error: 'Failed to download ID card' });
  }
};

module.exports = {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getMyProfile,
  generateIDCard,
  downloadIDCard
};
