const express = require('express');
const router = express.Router();
const { adminAuth } = require('../middleware/auth');
const {
  getAllTestimonials,
  getFeaturedTestimonials,
  getTestimonial,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial
} = require('../controllers/testimonialController');

// Public routes
router.get('/', getAllTestimonials);
router.get('/featured', getFeaturedTestimonials);
router.get('/:id', getTestimonial);

// Admin routes
router.post('/', adminAuth, createTestimonial);
router.put('/:id', adminAuth, updateTestimonial);
router.delete('/:id', adminAuth, deleteTestimonial);

module.exports = router;