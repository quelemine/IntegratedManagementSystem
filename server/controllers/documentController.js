const db = require('../config/database');
const path = require('path');
const fs = require('fs');
const { logAction } = require('../middleware/audit');

/**
 * Upload a document
 */
const uploadDocument = async (req, res) => {
  try {
    const { category, related_entity_type, related_entity_id } = req.body;
    const schoolId = req.user.school_id;
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const document = await db('files').insert({
      school_id: schoolId,
      uploaded_by: userId,
      file_name: req.file.originalname,
      file_path: req.file.path,
      file_size: req.file.size,
      file_type: req.file.mimetype,
      category: category || 'general',
      related_entity_type,
      related_entity_id
    }).returning('*');

    // Log audit
    await logAction(
      schoolId,
      userId,
      'create',
      'document',
      document[0].id,
      null,
      { file_name: req.file.originalname, category },
      req.ip,
      req.headers['user-agent']
    );

    res.status(201).json({
      success: true,
      data: document[0]
    });
  } catch (error) {
    console.error('Upload document error:', error);
    res.status(500).json({ success: false, error: 'Failed to upload document' });
  }
};

/**
 * Get all documents (with role-based filtering)
 */
const getDocuments = async (req, res) => {
  try {
    const { category, related_entity_type, related_entity_id } = req.query;
    const schoolId = req.user.school_id;
    const userId = req.user.id;
    const userRole = req.user.role;

    let query = db('files')
      .select('files.*', 'users.first_name', 'users.last_name', 'users.email')
      .leftJoin('users', 'files.uploaded_by', 'users.id')
      .where('files.school_id', schoolId);

    // Role-based filtering
    if (userRole === 'student') {
      // Students can only see their own documents
      query = query.where('files.uploaded_by', userId);
    } else if (userRole === 'teacher') {
      // Teachers can see their own documents
      query = query.where('files.uploaded_by', userId);
    } else if (userRole === 'parent') {
      // Parents can see their children's documents
      const children = await db('parent_student_relationships')
        .join('students', 'parent_student_relationships.student_id', 'students.id')
        .join('users', 'students.user_id', 'users.id')
        .where('parent_student_relationships.parent_id', 
          (await db('parents').where('user_id', userId).first('id')).id
        )
        .select('users.id');
      
      const childUserIds = children.map(c => c.id);
      query = query.whereIn('files.uploaded_by', childUserIds);
    }
    // Admins can see all documents (no additional filter)

    // Apply additional filters
    if (category) {
      query = query.where('files.category', category);
    }
    if (related_entity_type) {
      query = query.where('files.related_entity_type', related_entity_type);
    }
    if (related_entity_id) {
      query = query.where('files.related_entity_id', related_entity_id);
    }

    const documents = await query.orderBy('files.created_at', 'desc');

    res.json({
      success: true,
      data: documents
    });
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch documents' });
  }
};

/**
 * Get document by ID
 */
const getDocumentById = async (req, res) => {
  try {
    const { id } = req.params;
    const schoolId = req.user.school_id;
    const userId = req.user.id;
    const userRole = req.user.role;

    const document = await db('files')
      .select('files.*', 'users.first_name', 'users.last_name', 'users.email')
      .leftJoin('users', 'files.uploaded_by', 'users.id')
      .where('files.id', id)
      .where('files.school_id', schoolId)
      .first();

    if (!document) {
      return res.status(404).json({ success: false, error: 'Document not found' });
    }

    // Check permissions
    if (userRole === 'student' && document.uploaded_by !== userId) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }
    if (userRole === 'teacher' && document.uploaded_by !== userId) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    res.json({
      success: true,
      data: document
    });
  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch document' });
  }
};

/**
 * Download document
 */
const downloadDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const schoolId = req.user.school_id;
    const userId = req.user.id;
    const userRole = req.user.role;

    const document = await db('files')
      .where('id', id)
      .where('school_id', schoolId)
      .first();

    if (!document) {
      return res.status(404).json({ success: false, error: 'Document not found' });
    }

    // Check permissions
    if (userRole === 'student' && document.uploaded_by !== userId) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }
    if (userRole === 'teacher' && document.uploaded_by !== userId) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    // Check if file exists
    if (!fs.existsSync(document.file_path)) {
      return res.status(404).json({ success: false, error: 'File not found on server' });
    }

    res.download(document.file_path, document.file_name);
  } catch (error) {
    console.error('Download document error:', error);
    res.status(500).json({ success: false, error: 'Failed to download document' });
  }
};

/**
 * Delete document
 */
const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const schoolId = req.user.school_id;
    const userId = req.user.id;
    const userRole = req.user.role;

    const document = await db('files')
      .where('id', id)
      .where('school_id', schoolId)
      .first();

    if (!document) {
      return res.status(404).json({ success: false, error: 'Document not found' });
    }

    // Check permissions
    if (userRole === 'student' && document.uploaded_by !== userId) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }
    if (userRole === 'teacher' && document.uploaded_by !== userId) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    // Delete file from filesystem
    if (fs.existsSync(document.file_path)) {
      fs.unlinkSync(document.file_path);
    }

    // Delete from database
    await db('files').where('id', id).del();

    // Log audit
    await logAction(
      schoolId,
      userId,
      'delete',
      'document',
      id,
      { file_name: document.file_name },
      null,
      req.ip,
      req.headers['user-agent']
    );

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete document' });
  }
};

/**
 * Get documents by entity (e.g., student documents)
 */
const getDocumentsByEntity = async (req, res) => {
  try {
    const { entity_type, entity_id } = req.params;
    const schoolId = req.user.school_id;
    const userId = req.user.id;
    const userRole = req.user.role;

    let query = db('files')
      .select('files.*', 'users.first_name', 'users.last_name', 'users.email')
      .leftJoin('users', 'files.uploaded_by', 'users.id')
      .where('files.school_id', schoolId)
      .where('files.related_entity_type', entity_type)
      .where('files.related_entity_id', entity_id);

    // Role-based filtering
    if (userRole === 'student') {
      query = query.where('files.uploaded_by', userId);
    } else if (userRole === 'teacher') {
      query = query.where('files.uploaded_by', userId);
    }

    const documents = await query.orderBy('files.created_at', 'desc');

    res.json({
      success: true,
      data: documents
    });
  } catch (error) {
    console.error('Get documents by entity error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch documents' });
  }
};

module.exports = {
  uploadDocument,
  getDocuments,
  getDocumentById,
  downloadDocument,
  deleteDocument,
  getDocumentsByEntity
};
