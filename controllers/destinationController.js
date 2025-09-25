const Destination = require('../models/Destination');
const { PACKAGE_CATEGORIES, TOUR_TYPES } = require('../config/categories');
const { processSingleImage } = require('../utils/imageUtils');

// Helper function to generate slug from name
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim('-'); // Remove leading/trailing hyphens
};

// Helper function to ensure unique slug
const ensureUniqueSlug = async (baseSlug, existingId = null) => {
  let slug = baseSlug;
  let counter = 1;
  
  while (true) {
    const query = { slug };
    if (existingId) {
      query._id = { $ne: existingId };
    }
    
    const existing = await Destination.findOne(query);
    if (!existing) {
      return slug;
    }
    
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
};

// Helper function to transform image paths to full URLs
const transformDestinationImageUrl = (destination) => {
  if (destination.image) {
    destination.image = processSingleImage(destination.image);
  }
  return destination;
};

// Get all destinations
const getAllDestinations = async (req, res) => {
  try {
    const { trending, limit = 10, page = 1, tourType, country, state, category, holidayType } = req.query;
    
    let query = { isActive: true };
    
    if (trending === 'true') {
      query.isTrending = true;
    }

    if (tourType && ['international', 'india'].includes(tourType)) {
      query.tourType = tourType;
    }

    if (country) {
      query.country = { $regex: new RegExp(country, 'i') };
    }

    if (state) {
      // For international tours, if state matches country name, search by country instead
      if (tourType === 'international') {
        // Check if state parameter matches any country name
        const countryMatch = { $regex: new RegExp(state, 'i') };
        query.$or = [
          { state: countryMatch },
          { country: countryMatch }
        ];
      } else {
        query.state = { $regex: new RegExp(state, 'i') };
      }
    }

    if (category) {
      query.category = category;
    }

    if (holidayType) {
      query.holidayType = holidayType;
    }

    let destinations = await Destination.find(query)
      .sort({ createdAt: -1, visitCount: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    let total = await Destination.countDocuments(query);

    // If no destinations found and looking for international packages, try to get packages
    if (destinations.length === 0 && tourType === 'international') {
      const Package = require('../models/Package');
      const packages = await Package.find({
        isActive: true,
        tourType: 'international',
        ...(state ? {
          $or: [
            { state: { $regex: new RegExp(state, 'i') } },
            { country: { $regex: new RegExp(state, 'i') } }
          ]
        } : {})
      })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

      const packageTotal = await Package.countDocuments({
        isActive: true,
        tourType: 'international',
        ...(state ? {
          $or: [
            { state: { $regex: new RegExp(state, 'i') } },
            { country: { $regex: new RegExp(state, 'i') } }
          ]
        } : {})
      });

      // Transform packages to destinations format
      destinations = packages.map(pkg => ({
        _id: pkg._id,
        name: pkg.title,
        slug: pkg.slug,
        description: pkg.description,
        shortDescription: pkg.shortDescription,
        image: pkg.images && pkg.images.length > 0 ? pkg.images[0] : pkg.image,
        location: pkg.destination,
        rating: pkg.rating || 0,
        price: pkg.price,
        duration: pkg.duration,
        isActive: pkg.isActive,
        isTrending: pkg.isFeatured || false,
        visitCount: 0,
        country: pkg.country,
        state: pkg.state,
        tourType: pkg.tourType,
        category: pkg.category
      }));

      total = packageTotal;
    }

    // Transform image URLs
    const transformedDestinations = destinations.map(dest => transformDestinationImageUrl(dest));

    res.json({
      destinations: transformedDestinations,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        hasNext: parseInt(page) * parseInt(limit) < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get destinations error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get single destination
const getDestination = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if it's a valid ObjectId (24 character hex string)
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);
    
    let destination;
    if (isObjectId) {
      // Query by ObjectId
      destination = await Destination.findById(id);
    } else {
      // Query by slug
      destination = await Destination.findOne({ slug: id });
    }
    
    if (!destination) {
      return res.status(404).json({ message: 'Destination not found.' });
    }

    // Increment visit count
    destination.visitCount += 1;
    await destination.save();

    // Transform image URL
    const transformedDestination = transformDestinationImageUrl(destination);

    res.json(transformedDestination);
  } catch (error) {
    console.error('Get destination error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Create destination (Admin only)
const createDestination = async (req, res) => {
  try {
    // Validate required fields
    const requiredFields = ['name', 'description', 'shortDescription', 'location', 'country', 'tourType', 'category'];
    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({ message: `${field} is required` });
      }
    }

    // Validate tour type
    const validTourTypes = ['international', 'india'];
    if (!validTourTypes.includes(req.body.tourType)) {
      return res.status(400).json({ message: 'Invalid tour type. Must be one of: international, india' });
    }

    // Validate category
    if (!PACKAGE_CATEGORIES.includes(req.body.category)) {
      return res.status(400).json({ message: `Invalid category. Must be one of: ${PACKAGE_CATEGORIES.join(', ')}` });
    }

    // Generate slug from name
    const baseSlug = generateSlug(req.body.name);
    req.body.slug = await ensureUniqueSlug(baseSlug);
    
    // If image file is uploaded, use the uploaded file path
    if (req.file) {
      req.body.image = `/uploads/${req.file.filename}`;
    }
    
    const destination = new Destination(req.body);
    await destination.save();
    
    // Transform image URL
    const transformedDestination = transformDestinationImageUrl(destination);
    
    res.status(201).json({
      message: 'Destination created successfully',
      destination: transformedDestination
    });
  } catch (error) {
    console.error('Create destination error:', error);
    res.status(500).json({ message: 'Server error during destination creation.' });
  }
};

// Update destination (Admin only)
const updateDestination = async (req, res) => {
  try {
    // Validate tour type if provided
    if (req.body.tourType) {
      if (!TOUR_TYPES.includes(req.body.tourType)) {
        return res.status(400).json({ message: `Invalid tour type. Must be one of: ${TOUR_TYPES.join(', ')}` });
      }
    }

    // Validate category if provided
    if (req.body.category) {
      if (!PACKAGE_CATEGORIES.includes(req.body.category)) {
        return res.status(400).json({ message: `Invalid category. Must be one of: ${PACKAGE_CATEGORIES.join(', ')}` });
      }
    }

    // Generate slug from name if name is being updated
    if (req.body.name) {
      const baseSlug = generateSlug(req.body.name);
      req.body.slug = await ensureUniqueSlug(baseSlug, req.params.id);
    }
    
    // If image file is uploaded, use the uploaded file path
    if (req.file) {
      req.body.image = `/uploads/${req.file.filename}`;
    }
    
    const destination = await Destination.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!destination) {
      return res.status(404).json({ message: 'Destination not found.' });
    }

    // Transform image URL
    const transformedDestination = transformDestinationImageUrl(destination);

    res.json({
      message: 'Destination updated successfully',
      destination: transformedDestination
    });
  } catch (error) {
    console.error('Update destination error:', error);
    res.status(500).json({ message: 'Server error during destination update.' });
  }
};

// Delete destination (Admin only)
const deleteDestination = async (req, res) => {
  try {
    const destination = await Destination.findByIdAndDelete(req.params.id);
    
    if (!destination) {
      return res.status(404).json({ message: 'Destination not found.' });
    }

    res.json({ message: 'Destination deleted successfully' });
  } catch (error) {
    console.error('Delete destination error:', error);
    res.status(500).json({ message: 'Server error during destination deletion.' });
  }
};

// Get trending destinations
const getTrendingDestinations = async (req, res) => {
  try {
    const { limit = 6, country, state, tourType } = req.query;

    let query = { 
      isTrending: true, 
      isActive: true 
    };

    // Add filters if provided
    if (country) {
      query.country = { $regex: new RegExp(country, 'i') };
    }

    if (state) {
      // For international tours, if state matches country name, search by country instead
      if (tourType === 'international') {
        // Check if state parameter matches any country name
        const countryMatch = { $regex: new RegExp(state, 'i') };
        query.$or = [
          { state: countryMatch },
          { country: countryMatch }
        ];
      } else {
        query.state = { $regex: new RegExp(state, 'i') };
      }
    }

    if (tourType && ['international', 'india'].includes(tourType)) {
      query.tourType = tourType;
    }

    const destinations = await Destination.find(query)
      .sort({ createdAt: -1, visitCount: -1 })
      .limit(parseInt(limit));

    // Transform image URLs
    const transformedDestinations = destinations.map(dest => transformDestinationImageUrl(dest));

    res.json(transformedDestinations);
  } catch (error) {
    console.error('Get trending destinations error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Search destinations
const searchDestinations = async (req, res) => {
  try {
    const { q, location, tourType, country, state, category } = req.query;
    
    let query = { isActive: true };
    
    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { country: { $regex: q, $options: 'i' } },
        { state: { $regex: q, $options: 'i' } }
      ];
    }
    
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    if (tourType && ['international', 'india'].includes(tourType)) {
      query.tourType = tourType;
    }

    if (country) {
      query.country = { $regex: new RegExp(country, 'i') };
    }

    if (state) {
      // For international tours, if state matches country name, search by country instead
      if (tourType === 'international') {
        // Check if state parameter matches any country name
        const countryMatch = { $regex: new RegExp(state, 'i') };
        query.$or = [
          { state: countryMatch },
          { country: countryMatch }
        ];
      } else {
        query.state = { $regex: new RegExp(state, 'i') };
      }
    }

    if (category) {
      query.category = category;
    }

    const destinations = await Destination.find(query)
      .populate('holidayType', 'title slug image')
      .sort({ visitCount: -1 });
    
    // Transform image URLs
    const transformedDestinations = destinations.map(dest => transformDestinationImageUrl(dest));
    
    res.json(transformedDestinations);
  } catch (error) {
    console.error('Search destinations error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get destinations by tour type
const getDestinationsByTourType = async (req, res) => {
  try {
    const { tourType } = req.params;
    const { limit = 10, page = 1 } = req.query;
    
    let query = { isActive: true };
    
    if (tourType && ['international', 'india'].includes(tourType)) {
      query.tourType = tourType;
    }

    const destinations = await Destination.find(query)
      .populate('holidayType', 'title slug image')
      .sort({ createdAt: -1, visitCount: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Destination.countDocuments(query);

    // Transform image URLs
    const transformedDestinations = destinations.map(dest => transformDestinationImageUrl(dest));

    res.json({
      destinations: transformedDestinations,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        hasNext: parseInt(page) * parseInt(limit) < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get destinations by tour type error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get destinations by country
const getDestinationsByCountry = async (req, res) => {
  try {
    const { country } = req.params;
    const { limit = 10, page = 1 } = req.query;
    
    let query = { isActive: true };
    
    if (country) {
      query.country = { $regex: new RegExp(country, 'i') };
    }

    const destinations = await Destination.find(query)
      .populate('holidayType', 'title slug image')
      .sort({ createdAt: -1, visitCount: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Destination.countDocuments(query);

    // Transform image URLs
    const transformedDestinations = destinations.map(dest => transformDestinationImageUrl(dest));

    res.json({
      destinations: transformedDestinations,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        hasNext: parseInt(page) * parseInt(limit) < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get destinations by country error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get destinations by state
const getDestinationsByState = async (req, res) => {
  try {
    const { state } = req.params;
    const { limit = 10, page = 1 } = req.query;
    
    let query = { isActive: true };
    
    if (state) {
      query.state = { $regex: new RegExp(state, 'i') };
    }

    const destinations = await Destination.find(query)
      .populate('holidayType', 'title slug image')
      .sort({ createdAt: -1, visitCount: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Destination.countDocuments(query);

    // Transform image URLs
    const transformedDestinations = destinations.map(dest => transformDestinationImageUrl(dest));

    res.json({
      destinations: transformedDestinations,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        hasNext: parseInt(page) * parseInt(limit) < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get destinations by state error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get available countries
const getAvailableCountries = async (req, res) => {
  try {
    const countries = await Destination.distinct('country', { isActive: true });
    res.json({ countries: countries.sort() });
  } catch (error) {
    console.error('Get available countries error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get available tour types
const getAvailableTourTypes = async (req, res) => {
  try {
    const tourTypes = await Destination.distinct('tourType', { isActive: true });
    res.json({ tourTypes: tourTypes.sort() });
  } catch (error) {
    console.error('Get available tour types error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get available states
const getAvailableStates = async (req, res) => {
  try {
    const states = await Destination.distinct('state', { isActive: true, state: { $exists: true, $ne: null, $ne: '' } });
    res.json({ states: states.sort() });
  } catch (error) {
    console.error('Get available states error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = {
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
}; 