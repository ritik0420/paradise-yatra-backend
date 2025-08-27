const express = require('express');
const router = express.Router();
const { adminAuth } = require('../middleware/auth');
const { uploadSingleImage, handleUploadError } = require('../middleware/upload');
const {
  getAllDestinations,
  getDestination,
  createDestination,
  updateDestination,
  deleteDestination,
  getTrendingDestinations,
  searchDestinations,
  getDestinationsByTourType,
  getDestinationsByCountry,
  getDestinationsByState,
  getAvailableCountries,
  getAvailableTourTypes,
  getAvailableStates
} = require('../controllers/destinationController');

// Public routes
router.get('/', getAllDestinations);
router.get('/trending', getTrendingDestinations);
router.get('/search', searchDestinations);

// New filtering routes
router.get('/tour-type/:tourType', getDestinationsByTourType);
router.get('/country/:country', getDestinationsByCountry);
router.get('/state/:state', getDestinationsByState);

// Utility routes for available options
router.get('/countries', getAvailableCountries);
router.get('/tour-types', getAvailableTourTypes);
router.get('/states', getAvailableStates);

router.get('/:id', getDestination);

// Admin routes
router.post('/', adminAuth, uploadSingleImage, handleUploadError, createDestination);
router.put('/:id', adminAuth, uploadSingleImage, handleUploadError, updateDestination);
router.delete('/:id', adminAuth, deleteDestination);

module.exports = router; 