const express = require('express');
const router = express.Router();
const { adminAuth } = require('../middleware/auth');
const {
  getHeroContent,
  createHeroContent,
  updateHeroContent,
  deleteHeroContent
} = require('../controllers/heroController');

// Public routes
router.get('/', getHeroContent);

// Admin routes
router.post('/', adminAuth, createHeroContent);
router.put('/:id', adminAuth, updateHeroContent);
router.delete('/:id', adminAuth, deleteHeroContent);

module.exports = router;