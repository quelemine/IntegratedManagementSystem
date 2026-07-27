const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorization');
const db = require('../config/database');

// Get all courses for the school
router.get('/', authenticate, async (req, res) => {
  try {
    const schoolId = req.user.school_id;
    
    const courses = await db('courses')
      .select(
        'courses.*',
        'subjects.name as subject_name',
        'grades.name as grade_name',
        'users.first_name as teacher_first_name',
        'users.last_name as teacher_last_name'
      )
      .join('subjects', 'courses.subject_id', 'subjects.id')
      .join('grades', 'courses.grade_id', 'grades.id')
      .leftJoin('teachers', 'courses.teacher_id', 'teachers.id')
      .leftJoin('users', 'teachers.user_id', 'users.id')
      .where('courses.school_id', schoolId)
      .orderBy('courses.created_at', 'desc');
    
    res.json({ data: courses });
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

// Get a single course by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const schoolId = req.user.school_id;
    const { id } = req.params;
    
    const course = await db('courses')
      .select(
        'courses.*',
        'subjects.name as subject_name',
        'grades.name as grade_name',
        'users.first_name as teacher_first_name',
        'users.last_name as teacher_last_name'
      )
      .join('subjects', 'courses.subject_id', 'subjects.id')
      .join('grades', 'courses.grade_id', 'grades.id')
      .leftJoin('teachers', 'courses.teacher_id', 'teachers.id')
      .leftJoin('users', 'teachers.user_id', 'users.id')
      .where('courses.id', id)
      .where('courses.school_id', schoolId)
      .first();
    
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    res.json({ data: course });
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({ error: 'Failed to fetch course' });
  }
});

// Create a new course (admin/teacher only)
router.post('/', authenticate, authorize(['admin', 'principal', 'teacher']), async (req, res) => {
  try {
    const schoolId = req.user.school_id;
    const { subject_id, grade_id, teacher_id, name, description, academic_year } = req.body;
    
    if (!subject_id || !grade_id) {
      return res.status(400).json({ error: 'Subject and grade are required' });
    }
    
    const [course] = await db('courses')
      .insert({
        id: db.raw('gen_random_uuid()'),
        school_id: schoolId,
        subject_id,
        grade_id,
        teacher_id: teacher_id || null,
        name: name || null,
        description: description || null,
        academic_year: academic_year || new Date().getFullYear().toString(),
        created_at: db.fn.now(),
        updated_at: db.fn.now()
      })
      .returning('*');
    
    res.status(201).json({ data: course });
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({ error: 'Failed to create course' });
  }
});

// Update a course (admin/teacher only)
router.put('/:id', authenticate, authorize(['admin', 'principal', 'teacher']), async (req, res) => {
  try {
    const schoolId = req.user.school_id;
    const { id } = req.params;
    const { subject_id, grade_id, teacher_id, name, description, academic_year } = req.body;
    
    const existingCourse = await db('courses')
      .where('id', id)
      .where('school_id', schoolId)
      .first();
    
    if (!existingCourse) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    const [updatedCourse] = await db('courses')
      .where('id', id)
      .where('school_id', schoolId)
      .update({
        subject_id: subject_id || existingCourse.subject_id,
        grade_id: grade_id || existingCourse.grade_id,
        teacher_id: teacher_id !== undefined ? teacher_id : existingCourse.teacher_id,
        name: name !== undefined ? name : existingCourse.name,
        description: description !== undefined ? description : existingCourse.description,
        academic_year: academic_year || existingCourse.academic_year,
        updated_at: db.fn.now()
      })
      .returning('*');
    
    res.json({ data: updatedCourse });
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({ error: 'Failed to update course' });
  }
});

// Delete a course (admin only)
router.delete('/:id', authenticate, authorize(['admin', 'principal']), async (req, res) => {
  try {
    const schoolId = req.user.school_id;
    const { id } = req.params;
    
    const existingCourse = await db('courses')
      .where('id', id)
      .where('school_id', schoolId)
      .first();
    
    if (!existingCourse) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    await db('courses')
      .where('id', id)
      .where('school_id', schoolId)
      .del();
    
    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({ error: 'Failed to delete course' });
  }
});

module.exports = router;
