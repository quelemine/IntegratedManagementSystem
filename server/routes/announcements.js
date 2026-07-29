const express = require('express');
const router = express.Router();
const {
  getAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement
} = require('../controllers/announcementController');
const { authenticate, optionalAuth } = require('../middleware/auth');

// GET /api/announcements - Get all announcements (optional auth for public view)
router.get('/', optionalAuth, getAnnouncements);

// All other routes require authentication
router.use(authenticate);

// GET /api/announcements/:id - Get a specific announcement
router.get('/:id', getAnnouncementById);

// POST /api/announcements - Create a new announcement (Admin/Principal only)
router.post('/', createAnnouncement);

// PUT /api/announcements/:id - Update an announcement (Admin/Principal only)
router.put('/:id', updateAnnouncement);

// DELETE /api/announcements/:id - Delete an announcement (Admin/Principal only)
router.delete('/:id', deleteAnnouncement);

module.exports = router;
