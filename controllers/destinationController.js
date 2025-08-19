const Destination = require('../models/Destination');

// Helper function to transform image paths to full URLs
const transformDestinationImageUrl = (destination, req) => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  
  if (destination.image && !destination.image.startsWith('http')) {
    // Remove leading slash to avoid double slashes
    const cleanImagePath = destination.image.startsWith('/') ? destination.image.substring(1) : destination.image;
    destination.image = `${baseUrl}/${cleanImagePath}`;
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
      query.state = { $regex: new RegExp(state, 'i') };
    }

    if (category) {
      query.category = category;
    }

    if (holidayType) {
      query.holidayType = holidayType;
    }

    const destinations = await Destination.find(query)
      .sort({ visitCount: -1, createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Destination.countDocuments(query);

    // Transform image URLs
    const transformedDestinations = destinations.map(dest => transformDestinationImageUrl(dest, req));

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
    const destination = await Destination.findById(req.params.id);
    
    if (!destination) {
      return res.status(404).json({ message: 'Destination not found.' });
    }

    // Increment visit count
    destination.visitCount += 1;
    await destination.save();

    // Transform image URL
    const transformedDestination = transformDestinationImageUrl(destination, req);

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
    const validCategories = ['Beach Holidays', 'Adventure Tours', 'Cultural Tours', 'Mountain Treks', 'Wildlife Safaris', 'Pilgrimage Tours', 'Honeymoon Packages', 'Family Tours', 'Luxury Tours', 'Budget Tours', 'Premium Tours'];
    if (!validCategories.includes(req.body.category)) {
      return res.status(400).json({ message: 'Invalid category. Must be one of: Beach Holidays, Adventure Tours, Cultural Tours, Mountain Treks, Wildlife Safaris, Pilgrimage Tours, Honeymoon Packages, Family Tours, Luxury Tours, Budget Tours, Premium Tours' });
    }

    // If image file is uploaded, use the uploaded file path
    if (req.file) {
      req.body.image = `/uploads/${req.file.filename}`;
    }
    
    const destination = new Destination(req.body);
    await destination.save();
    
    // Transform image URL
    const transformedDestination = transformDestinationImageUrl(destination, req);
    
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
      const validTourTypes = ['international', 'india'];
      if (!validTourTypes.includes(req.body.tourType)) {
        return res.status(400).json({ message: 'Invalid tour type. Must be one of: international, india' });
      }
    }

    // Validate category if provided
    if (req.body.category) {
      const validCategories = ['Beach Holidays', 'Adventure Tours', 'Cultural Tours', 'Mountain Treks', 'Wildlife Safaris', 'Pilgrimage Tours', 'Honeymoon Packages', 'Family Tours', 'Luxury Tours', 'Budget Tours', 'Premium Tours'];
      if (!validCategories.includes(req.body.category)) {
        return res.status(400).json({ message: 'Invalid category. Must be one of: Beach Holidays, Adventure Tours, Cultural Tours, Mountain Treks, Wildlife Safaris, Pilgrimage Tours, Honeymoon Packages, Family Tours, Luxury Tours, Budget Tours, Premium Tours' });
      }
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
    const transformedDestination = transformDestinationImageUrl(destination, req);

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
    const { limit = 6 } = req.query;

    const destinations = await Destination.find({ 
      isTrending: true, 
      isActive: true 
    })
    .sort({ visitCount: -1, createdAt: -1 })
    .limit(parseInt(limit));

    // Transform image URLs
    const transformedDestinations = destinations.map(dest => transformDestinationImageUrl(dest, req));

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
        { description: { $regex: q, $options: 'i' } }
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
      query.state = { $regex: new RegExp(state, 'i') };
    }

    if (category) {
      query.category = category;
    }

    const destinations = await Destination.find(query)
      .populate('holidayType', 'title slug image')
      .sort({ visitCount: -1 });
    
    // Transform image URLs
    const transformedDestinations = destinations.map(dest => transformDestinationImageUrl(dest, req));
    
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
      .sort({ visitCount: -1, createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Destination.countDocuments(query);

    // Transform image URLs
    const transformedDestinations = destinations.map(dest => transformDestinationImageUrl(dest, req));

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
      .sort({ visitCount: -1, createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Destination.countDocuments(query);

    // Transform image URLs
    const transformedDestinations = destinations.map(dest => transformDestinationImageUrl(dest, req));

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
      .sort({ visitCount: -1, createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Destination.countDocuments(query);

    // Transform image URLs
    const transformedDestinations = destinations.map(dest => transformDestinationImageUrl(dest, req));

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