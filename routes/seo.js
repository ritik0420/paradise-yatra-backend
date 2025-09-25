const express = require('express');
const router = express.Router();
const { 
  getSEOSettings, 
  updateSEOSettings, 
  getAllSEOSettings, 
  deleteSEOSettings,
  getDynamicSEOSettings,
  updateDynamicSEOSettings
} = require('../controllers/seoController');
const { auth } = require('../middleware/auth');

// Get all SEO settings (admin only)
router.get('/', auth, getAllSEOSettings);

// Get dynamic SEO settings for package pages (admin only)
router.get('/packages-dynamic', auth, getDynamicSEOSettings);

// Update dynamic SEO settings for package pages (admin only)
router.put('/packages-dynamic', auth, updateDynamicSEOSettings);

// Get SEO settings for a specific page
router.get('/:page', getSEOSettings);

// Update SEO settings for a specific page (admin only)
router.put('/:page', auth, updateSEOSettings);

// Delete SEO settings for a specific page (admin only)
router.delete('/:page', auth, deleteSEOSettings);

module.exports = router;
