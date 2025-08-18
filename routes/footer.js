const express = require('express');
const router = express.Router();
const { adminAuth } = require('../middleware/auth');
const {
  getFooterContent,
  getAllFooterContent,
  createFooterContent,
  updateFooterContent,
  deleteFooterContent,
  toggleFooterContentStatus
} = require('../controllers/footerController');

// Public routes
router.get('/', getFooterContent);

// Admin routes
router.get('/admin/all', adminAuth, getAllFooterContent);
router.post('/admin', adminAuth, createFooterContent);
router.put('/admin/:id', adminAuth, updateFooterContent);
router.delete('/admin/:id', adminAuth, deleteFooterContent);
router.put('/admin/:id/toggle-status', adminAuth, toggleFooterContentStatus);

module.exports = router;
