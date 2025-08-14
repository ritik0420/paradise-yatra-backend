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
        // Remove leading slash to avoid double slashes
        const cleanImagePath = img.startsWith('/') ? img.substring(1) : img;
        return `${baseUrl}/${cleanImagePath}`;
      });
    }
    return pkg;
  });
};

// Helper function to generate slug from title
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-');
};

// Helper function to generate unique slug
const generateUniqueSlug = async (title) => {
  let slug = generateSlug(title);
  let counter = 1;
  let uniqueSlug = slug;
  
  while (await Package.findOne({ slug: uniqueSlug })) {
    uniqueSlug = `${slug}-${counter}`;
    counter++;
  }
  
  return uniqueSlug;
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

    // Generate unique slug if not provided
    if (!req.body.slug) {
      req.body.slug = await generateUniqueSlug(req.body.title);
    } else {
      // Check if provided slug is unique
      const existingPackage = await Package.findOne({ slug: req.body.slug });
      if (existingPackage) {
        return res.status(400).json({ message: 'Slug already exists. Please choose a different one.' });
      }
    }

    // Handle image uploads if present
    if (req.files && req.files.length > 0) {
      req.body.images = req.files.map(file => {
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        return `${baseUrl}/${file.path}`;
      });
    }

    // Handle single image upload if present
    if (req.file) {
      req.body.image = `/uploads/${req.file.filename}`;
    }

    // Handle single image upload if present
    if (req.file) {
      req.body.image = `/uploads/${req.file.filename}`;
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

    // Generate slug if missing or if title has changed
    if (!req.body.slug || (req.body.title && req.body.title !== existingPackage.title)) {
      req.body.slug = await generateUniqueSlug(req.body.title || existingPackage.title);
    } else if (req.body.slug) {
      // Check if provided slug is unique (excluding current package)
      const existingPackageWithSlug = await Package.findOne({ 
        slug: req.body.slug, 
        _id: { $ne: packageId } 
      });
      if (existingPackageWithSlug) {
        return res.status(400).json({ message: 'Slug already exists. Please choose a different one.' });
      }
    }

    // Handle image uploads if present
    if (req.files && req.files.length > 0) {
      req.body.images = req.files.map(file => {
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        return `${baseUrl}/${file.path}`;
      });
    }

    // Handle single image upload if present
    if (req.file) {
      req.body.image = `/uploads/${req.file.filename}`;
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

// Get package by slug
const getPackageBySlug = async (req, res) => {
  try {
    const package = await Package.findOne({ slug: req.params.slug, isActive: true });
    
    if (!package) {
      return res.status(404).json({ message: 'Package not found.' });
    }

    // Transform image URLs
    const transformedPackage = transformImageUrls([package], req)[0];

    res.json(transformedPackage);
  } catch (error) {
    console.error('Get package by slug error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Suggest packages for search dropdown
const suggestPackages = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim().length === 0) {
      return res.json({ suggestions: [] });
    }

    const searchQuery = q.trim();
    
    // Validate search query length
    if (searchQuery.length < 2) {
      return res.json({ suggestions: [] });
    }
    
    // Create case-insensitive search query for title and description
    const query = {
      isActive: true,
      $and: [
        {
          $or: [
            { title: { $regex: searchQuery, $options: 'i' } },
            { description: { $regex: searchQuery, $options: 'i' } },
            { destination: { $regex: searchQuery, $options: 'i' } }
          ]
        },
        // Ensure required fields exist and are not null/undefined
        { title: { $exists: true, $ne: null, $ne: '' } },
        { destination: { $exists: true, $ne: null, $ne: '' } }
      ]
    };

    console.log('Search query:', searchQuery);
    console.log('MongoDB query:', JSON.stringify(query));

    // Find packages with relevance scoring
    const packages = await Package.find(query)
      .select('title description destination price duration category slug images')
      .limit(10)
      .lean(); // Use lean() for better performance

    console.log(`Found ${packages.length} packages matching query`);

    if (!packages || packages.length === 0) {
      return res.json({ suggestions: [] });
    }

    // Score and sort by relevance with error handling
    const scoredPackages = packages.map(pkg => {
      try {
        let score = 0;
        const searchLower = searchQuery.toLowerCase();
        
        // Safely check title
        if (pkg.title && typeof pkg.title === 'string') {
          if (pkg.title.toLowerCase().includes(searchLower)) {
            score += 10;
            // Exact title match gets bonus
            if (pkg.title.toLowerCase() === searchLower) {
              score += 5;
            }
          }
        }
        
        // Safely check destination
        if (pkg.destination && typeof pkg.destination === 'string') {
          if (pkg.destination.toLowerCase().includes(searchLower)) {
            score += 8;
          }
        }
        
        // Safely check description
        if (pkg.description && typeof pkg.description === 'string') {
          if (pkg.description.toLowerCase().includes(searchLower)) {
            score += 3;
          }
        }
        
        return { ...pkg, score };
      } catch (err) {
        console.error('Error processing package:', pkg._id, err);
        return { ...pkg, score: 0 };
      }
    });

    // Sort by score (descending) and take top 5
    const suggestions = scoredPackages
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, 5)
      .map(pkg => ({
        id: pkg._id,
        title: pkg.title || 'Untitled Package',
        destination: pkg.destination || 'Unknown Destination',
        price: pkg.price || 0,
        duration: pkg.duration || 'N/A',
        category: pkg.category || 'holiday',
        slug: pkg.slug || '',
        image: pkg.images && Array.isArray(pkg.images) && pkg.images.length > 0 ? pkg.images[0] : null
      }));

    console.log(`Returning ${suggestions.length} suggestions`);
    res.json({ suggestions });
    
  } catch (error) {
    console.error('Suggest packages error:', error);
    console.error('Error stack:', error.stack);
    
    // Return empty suggestions instead of 500 error
    res.json({ 
      suggestions: [],
      error: process.env.NODE_ENV === 'development' ? error.message : 'Search temporarily unavailable'
    });
  }
};

module.exports = {
  getAllPackages,
  getPackage,
  getPackageBySlug,
  createPackage,
  updatePackage,
  deletePackage,
  getPackagesByCategory,
  searchPackages,
  addReview,
  suggestPackages
}; 