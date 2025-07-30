const express = require('express');
const router = express.Router();
const { auth, adminAuth } = require('../middleware/auth');
const {
  getAllBlogs,
  getBlog,
  createBlog,
  updateBlog,
  deleteBlog,
  getFeaturedBlogs,
  searchBlogs,
  likeBlog
} = require('../controllers/blogController');

// Public routes
router.get('/', getAllBlogs);
router.get('/featured', getFeaturedBlogs);
router.get('/search', searchBlogs);
router.get('/:id', getBlog);

// Protected routes
router.post('/:id/like', auth, likeBlog);

// Admin routes
router.post('/', adminAuth, createBlog);
router.put('/:id', adminAuth, updateBlog);
router.delete('/:id', adminAuth, deleteBlog);

module.exports = router; 