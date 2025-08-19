const express = require('express');
const router = express.Router();
const { auth, adminAuth } = require('../middleware/auth');
const { uploadPackageImages, uploadSingleImage, handleUploadError } = require('../middleware/upload');
const {
  getAllPackages,
  getPackage,
  getPackageBySlug,
  createPackage,
  updatePackage,
  deletePackage,
  getPackagesByCategory,
  searchPackages,
  addReview,
  suggestPackages,
  getPackagesByTourType,
  getPackagesByCountry,
  getPackagesByState,
  getPackagesByHolidayType,
  getAvailableCountries,
  getAvailableTourTypes,
  getAvailableStates
} = require('../controllers/packageController');

// Public routes
router.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Packages API is running',
    timestamp: new Date().toISOString()
  });
});
router.get('/', getAllPackages);
router.get('/search', searchPackages);
router.get('/suggest', suggestPackages);
router.get('/category/:category', getPackagesByCategory);
router.get('/tour-type/:tourType', getPackagesByTourType);
router.get('/country/:country', getPackagesByCountry);
router.get('/state/:state', getPackagesByState);
router.get('/holiday-type/:holidayTypeId', getPackagesByHolidayType);
router.get('/countries', getAvailableCountries);
router.get('/tour-types', getAvailableTourTypes);
router.get('/states', getAvailableStates);
router.get('/slug/:slug', getPackageBySlug);
router.get('/:id', getPackage);

// Protected routes
router.post('/:id/reviews', auth, addReview);

// Admin routes with file upload
router.post('/', adminAuth, uploadSingleImage, handleUploadError, createPackage);
router.put('/:id', adminAuth, uploadSingleImage, handleUploadError, updatePackage);
router.delete('/:id', adminAuth, deletePackage);

module.exports = router; 