const express = require('express');
const router = express.Router();
const { adminAuth } = require('../middleware/auth');
const {
  getAllDestinations,
  getDestination,
  createDestination,
  updateDestination,
  deleteDestination,
  getTrendingDestinations,
  searchDestinations
} = require('../controllers/destinationController');

// Public routes
router.get('/', getAllDestinations);
router.get('/trending', getTrendingDestinations);
router.get('/search', searchDestinations);
router.get('/:id', getDestination);

// Admin routes
router.post('/', adminAuth, createDestination);
router.put('/:id', adminAuth, updateDestination);
router.delete('/:id', adminAuth, deleteDestination);

module.exports = router; 