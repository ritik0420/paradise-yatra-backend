const Package = require('../models/Package');

// Helper function to transform image paths to full URLs
const transformImageUrls = (packages, req) => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  
  return packages.map(pkg => {
    if (pkg.images && Array.isArray(pkg.images)) {
      pkg.images = pkg.images.map(img => {
        // If the image is already a full URL, return as is
        if (img.startsWith('http')) {
          return img;
        }
        // If it's a file path, convert to full URL
        return `${baseUrl}/${img}`;
      });
    }
    return pkg;
  });
};

// Get all packages
const getAllPackages = async (req, res) => {
  try {
    const { category, featured, limit = 10, page = 1 } = req.query;
    
    let query = { isActive: true };
    
    if (category) {
      query.category = category;
    }
    
    if (featured === 'true') {
      query.isFeatured = true;
    }

    const packages = await Package.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Package.countDocuments(query);

    // Transform image URLs
    const transformedPackages = transformImageUrls(packages, req);

    res.json({
      packages: transformedPackages,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        hasNext: parseInt(page) * parseInt(limit) < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get packages error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get single package
const getPackage = async (req, res) => {
  try {
    const package = await Package.findById(req.params.id);
    
    if (!package) {
      return res.status(404).json({ message: 'Package not found.' });
    }

    // Transform image URLs
    const transformedPackage = transformImageUrls([package], req)[0];

    res.json(transformedPackage);
  } catch (error) {
    console.error('Get package error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Create package (Admin only)
const createPackage = async (req, res) => {
  try {
    // Validate required fields
    const requiredFields = ['title', 'description', 'shortDescription', 'price', 'duration', 'destination', 'category'];
    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({ message: `${field} is required` });
      }
    }

    // Validate category
    const validCategories = ['premium', 'adventure', 'holiday', 'trending'];
    if (!validCategories.includes(req.body.category)) {
      return res.status(400).json({ message: 'Invalid category. Must be one of: premium, adventure, holiday, trending' });
    }

    // Validate price
    if (req.body.price < 0) {
      return res.status(400).json({ message: 'Price must be a positive number' });
    }

    // Handle image uploads if present
    if (req.files && req.files.length > 0) {
      req.body.images = req.files.map(file => {
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        return `${baseUrl}/${file.path}`;
      });
    }

    const package = new Package(req.body);
    await package.save();
    
    // Transform image URLs
    const transformedPackage = transformImageUrls([package], req)[0];
    
    res.status(201).json({
      message: 'Package created successfully',
      package: transformedPackage
    });
  } catch (error) {
    console.error('Create package error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error during package creation.' });
  }
};

// Update package (Admin only)
const updatePackage = async (req, res) => {
  try {
    const packageId = req.params.id;
    
    // Check if package exists
    const existingPackage = await Package.findById(packageId);
    if (!existingPackage) {
      return res.status(404).json({ message: 'Package not found.' });
    }

    // Validate category if provided
    if (req.body.category) {
      const validCategories = ['premium', 'adventure', 'holiday', 'trending'];
      if (!validCategories.includes(req.body.category)) {
        return res.status(400).json({ message: 'Invalid category. Must be one of: premium, adventure, holiday, trending' });
      }
    }

    // Validate price if provided
    if (req.body.price !== undefined && req.body.price < 0) {
      return res.status(400).json({ message: 'Price must be a positive number' });
    }

    // Handle image uploads if present
    if (req.files && req.files.length > 0) {
      req.body.images = req.files.map(file => {
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        return `${baseUrl}/${file.path}`;
      });
    }

    const package = await Package.findByIdAndUpdate(
      packageId,
      req.body,
      { new: true, runValidators: true }
    );

    // Transform image URLs
    const transformedPackage = transformImageUrls([package], req)[0];

    res.json({
      message: 'Package updated successfully',
      package: transformedPackage
    });
  } catch (error) {
    console.error('Update package error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error during package update.' });
  }
};

// Delete package (Admin only)
const deletePackage = async (req, res) => {
  try {
    const package = await Package.findByIdAndDelete(req.params.id);
    
    if (!package) {
      return res.status(404).json({ message: 'Package not found.' });
    }

    res.json({ message: 'Package deleted successfully' });
  } catch (error) {
    console.error('Delete package error:', error);
    res.status(500).json({ message: 'Server error during package deletion.' });
  }
};

// Get packages by category
const getPackagesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { limit = 6 } = req.query;

    const packages = await Package.find({ 
      category, 
      isActive: true 
    })
    .sort({ createdAt: -1 })
    .limit(parseInt(limit));

    // Transform image URLs
    const transformedPackages = transformImageUrls(packages, req);

    res.json(transformedPackages);
  } catch (error) {
    console.error('Get packages by category error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Search packages
const searchPackages = async (req, res) => {
  try {
    const { q, category, minPrice, maxPrice } = req.query;
    
    let query = { isActive: true };
    
    if (q) {
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { destination: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ];
    }
    
    if (category) {
      query.category = category;
    }
    
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    const packages = await Package.find(query).sort({ createdAt: -1 });
    
    // Transform image URLs
    const transformedPackages = transformImageUrls(packages, req);
    
    res.json(transformedPackages);
  } catch (error) {
    console.error('Search packages error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Add review to package
const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const package = await Package.findById(req.params.id);
    
    if (!package) {
      return res.status(404).json({ message: 'Package not found.' });
    }

    // Check if user already reviewed
    const existingReview = package.reviews.find(
      review => review.user.toString() === req.user.id
    );

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this package.' });
    }

    package.reviews.push({
      user: req.user.id,
      rating,
      comment
    });

    // Update average rating
    const totalRating = package.reviews.reduce((sum, review) => sum + review.rating, 0);
    package.rating = totalRating / package.reviews.length;

    await package.save();

    res.json({
      message: 'Review added successfully',
      package
    });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({ message: 'Server error during review addition.' });
  }
};

module.exports = {
  getAllPackages,
  getPackage,
  createPackage,
  updatePackage,
  deletePackage,
  getPackagesByCategory,
  searchPackages,
  addReview
}; 