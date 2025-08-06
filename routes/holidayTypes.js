const express = require('express');
const router = express.Router();
const { auth, adminAuth } = require('../middleware/auth');
const {
  getAllHolidayTypes,
  getAllHolidayTypesAdmin,
  getHolidayType,
  getHolidayTypeBySlug,
  createHolidayType,
  updateHolidayType,
  deleteHolidayType,
  toggleHolidayTypeStatus,
  toggleHolidayTypeFeatured,
  updateHolidayTypeOrder
} = require('../controllers/holidayTypeController');

// Public routes
router.get('/', getAllHolidayTypes);
router.get('/slug/:slug', getHolidayTypeBySlug);
router.get('/:id', getHolidayType);

// Admin routes
router.get('/admin/all', adminAuth, getAllHolidayTypesAdmin);
router.post('/', adminAuth, createHolidayType);
router.put('/:id', adminAuth, updateHolidayType);
router.delete('/:id', adminAuth, deleteHolidayType);
router.patch('/:id/toggle-status', adminAuth, toggleHolidayTypeStatus);
router.patch('/:id/toggle-featured', adminAuth, toggleHolidayTypeFeatured);
router.patch('/:id/order', adminAuth, updateHolidayTypeOrder);

module.exports = router; 