const express = require('express');
const router = express.Router();
const { auth, adminAuth } = require('../middleware/auth');
const { uploadSingleImage, handleUploadError } = require('../middleware/upload');
const {
  getAllFixedDepartures,
  getFixedDeparture,
  getFixedDepartureBySlug,
  createFixedDeparture,
  updateFixedDeparture,
  deleteFixedDeparture,
  toggleFeatured,
  toggleStatus,
  getFeaturedFixedDepartures,
  searchFixedDepartures
} = require('../controllers/fixedDepartureController');

// Public routes
router.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Fixed Departures API is running',
    timestamp: new Date().toISOString()
  });
});

router.get('/', getAllFixedDepartures);
router.get('/featured', getFeaturedFixedDepartures);
router.get('/search', searchFixedDepartures);
router.get('/slug/:slug', getFixedDepartureBySlug);
router.get('/:id', getFixedDeparture);

// Admin routes
router.post('/', adminAuth, uploadSingleImage, handleUploadError, createFixedDeparture);
router.put('/:id', adminAuth, uploadSingleImage, handleUploadError, updateFixedDeparture);
router.delete('/:id', adminAuth, deleteFixedDeparture);
router.patch('/:id/toggle-featured', adminAuth, toggleFeatured);
router.patch('/:id/toggle-status', adminAuth, toggleStatus);

module.exports = router;
