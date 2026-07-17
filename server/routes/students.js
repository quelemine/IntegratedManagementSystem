const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { authenticate } = require('../middleware/auth');
const { authorize, schoolScope } = require('../middleware/authorization');
const { validate, validationRules } = require('../middleware/validation');
const { auditLog } = require('../middleware/audit');

router.get('/', authenticate, schoolScope, validationRules.pagination, validate, studentController.getStudents);
router.get('/my-profile', authenticate, authorize(['student']), studentController.getMyProfile);
router.post('/', authenticate, authorize(['super_admin', 'principal', 'teacher']), auditLog('create'), studentController.createStudent);
router.get('/:id', authenticate, schoolScope, validationRules.uuidParam, validate, studentController.getStudentById);
router.put('/:id', authenticate, authorize(['super_admin', 'principal', 'teacher']), schoolScope, validationRules.uuidParam, validate, auditLog('update'), studentController.updateStudent);
router.delete('/:id', authenticate, authorize(['super_admin']), schoolScope, validationRules.uuidParam, validate, auditLog('delete'), studentController.deleteStudent);
router.post('/:id/generate-id-card', authenticate, authorize(['super_admin', 'principal', 'teacher']), schoolScope, validationRules.uuidParam, validate, auditLog('create'), studentController.generateIDCard);
router.get('/:id/download-id-card', authenticate, schoolScope, validationRules.uuidParam, validate, studentController.downloadIDCard);

module.exports = router;
