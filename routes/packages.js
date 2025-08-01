const express = require('express');
const router = express.Router();
const { auth, adminAuth } = require('../middleware/auth');
const { uploadPackageImages, handleUploadError } = require('../middleware/upload');
const {
  getAllPackages,
  getPackage,
  createPackage,
  updatePackage,
  deletePackage,
  getPackagesByCategory,
  searchPackages,
  addReview
} = require('../controllers/packageController');

// Public routes
router.get('/', getAllPackages);
router.get('/search', searchPackages);
router.get('/category/:category', getPackagesByCategory);
router.get('/:id', getPackage);

// Protected routes
router.post('/:id/reviews', auth, addReview);

// Admin routes with file upload
router.post('/', adminAuth, uploadPackageImages, handleUploadError, createPackage);
router.put('/:id', adminAuth, uploadPackageImages, handleUploadError, updatePackage);
router.delete('/:id', adminAuth, deletePackage);

module.exports = router; 