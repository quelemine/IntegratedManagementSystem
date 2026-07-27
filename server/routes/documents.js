const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {
  uploadDocument,
  getDocuments,
  getDocumentById,
  downloadDocument,
  deleteDocument,
  getDocumentsByEntity
} = require('../controllers/documentController');
const { authenticate } = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../uploads/documents');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// File validation
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, Word, and image files are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: fileFilter
});

// All routes require authentication
router.use(authenticate);

// POST /api/documents/upload - Upload a document
router.post('/upload', upload.single('file'), uploadDocument);

// GET /api/documents - Get all documents (with filtering)
router.get('/', getDocuments);

// GET /api/documents/:id - Get document by ID
router.get('/:id', getDocumentById);

// GET /api/documents/:id/download - Download document
router.get('/:id/download', downloadDocument);

// DELETE /api/documents/:id - Delete document
router.delete('/:id', deleteDocument);

// GET /api/documents/entity/:entity_type/:entity_id - Get documents by entity
router.get('/entity/:entity_type/:entity_id', getDocumentsByEntity);

module.exports = router;
