const express = require('express');
const router = express.Router();
const { adminAuth } = require('../middleware/auth');
const User = require('../models/User');
const Package = require('../models/Package');
const Destination = require('../models/Destination');
const Blog = require('../models/Blog');

// Get admin dashboard stats
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalPackages = await Package.countDocuments();
    const totalDestinations = await Destination.countDocuments();
    const totalBlogs = await Blog.countDocuments();
    const packageStats = await Package.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    res.json({
      totalUsers,
      totalPackages,
      totalDestinations,
      totalBlogs,
      packageStats
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get all users (Admin only)
const getAllUsers = async (req, res) => {
  try {
    const { limit = 20, page = 1 } = req.query;
    
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await User.countDocuments();

    res.json({
      users,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        hasNext: parseInt(page) * parseInt(limit) < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Update user status (Admin only)
const updateUserStatus = async (req, res) => {
  try {
    const { isActive } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json({
      message: 'User status updated successfully',
      user
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ message: 'Server error during user status update.' });
  }
};

// Get admin analytics
const getAnalytics = async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(period));

    // Popular packages
    const popularPackages = await Package.aggregate([
      { $sort: { rating: -1 } },
      { $limit: 5 },
      { $project: { title: 1, rating: 1, category: 1 } }
    ]);

    // Package category distribution
    const packageCategoryStats = await Package.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    res.json({
      popularPackages,
      packageCategoryStats
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get all packages for admin (with inactive packages)
const getAllPackagesForAdmin = async (req, res) => {
  try {
    const { category, status, limit = 20, page = 1 } = req.query;
    
    let query = {};
    
    if (category) {
      query.category = category;
    }
    
    if (status === 'active') {
      query.isActive = true;
    } else if (status === 'inactive') {
      query.isActive = false;
    }

    const packages = await Package.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Package.countDocuments(query);

    res.json({
      packages,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        hasNext: parseInt(page) * parseInt(limit) < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get all packages for admin error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Bulk update package status
const bulkUpdatePackageStatus = async (req, res) => {
  try {
    const { packageIds, isActive } = req.body;
    
    if (!packageIds || !Array.isArray(packageIds)) {
      return res.status(400).json({ message: 'Package IDs array is required' });
    }

    const result = await Package.updateMany(
      { _id: { $in: packageIds } },
      { isActive }
    );

    res.json({
      message: `${result.modifiedCount} packages updated successfully`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Bulk update package status error:', error);
    res.status(500).json({ message: 'Server error during bulk update.' });
  }
};

// Get package statistics
const getPackageStats = async (req, res) => {
  try {
    const totalPackages = await Package.countDocuments();
    const activePackages = await Package.countDocuments({ isActive: true });
    const featuredPackages = await Package.countDocuments({ isFeatured: true });
    
    const categoryStats = await Package.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    const priceStats = await Package.aggregate([
      { $group: { 
        _id: null, 
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' }
      }}
    ]);

    res.json({
      totalPackages,
      activePackages,
      featuredPackages,
      categoryStats,
      priceStats: priceStats[0] || { avgPrice: 0, minPrice: 0, maxPrice: 0 }
    });
  } catch (error) {
    console.error('Get package stats error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Admin routes
router.get('/dashboard', adminAuth, getDashboardStats);
router.get('/users', adminAuth, getAllUsers);
router.put('/users/:id/status', adminAuth, updateUserStatus);
router.get('/analytics', adminAuth, getAnalytics);
router.get('/packages', adminAuth, getAllPackagesForAdmin);
router.put('/packages/bulk-status', adminAuth, bulkUpdatePackageStatus);
router.get('/packages/stats', adminAuth, getPackageStats);

module.exports = router; 