const express = require('express');
const router = express.Router();
const {
  getAllFAQs,
  getFAQById,
  createFAQ,
  updateFAQ,
  deleteFAQ,
  reorderFAQ,
  getLocations,
  getFAQStats
} = require('../controllers/faqController');

// Public routes
router.get('/', getAllFAQs);
router.get('/admin/locations', getLocations);
router.get('/admin/stats', getFAQStats);

// Admin routes (these would typically require authentication)
router.post('/', createFAQ);
router.put('/reorder', reorderFAQ); // Must come before /:id route
router.get('/:id', getFAQById);
router.put('/:id', updateFAQ);
router.delete('/:id', deleteFAQ);

module.exports = router;
