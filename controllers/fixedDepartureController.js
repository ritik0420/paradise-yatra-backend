const FixedDeparture = require('../models/FixedDeparture');

// Get all fixed departures
const getAllFixedDepartures = async (req, res) => {
  try {
     const { page = 1, limit = 10, status, featured } = req.query;
    
    const query = { isActive: true };
    
    if (status) {
      query.status = status;
    }
    
    if (featured === 'true') {
      query.isFeatured = true;
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { departureDate: 1 }
    };

    const fixedDepartures = await FixedDeparture.find(query)
      .sort(options.sort)
      .limit(options.limit * 1)
      .skip((options.page - 1) * options.limit)
      .exec();

    const count = await FixedDeparture.countDocuments(query);

    res.json({
      fixedDepartures,
      totalPages: Math.ceil(count / options.limit),
      currentPage: options.page,
      total: count
    });
  } catch (error) {
    console.error('Error fetching fixed departures:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get fixed departure by ID
const getFixedDeparture = async (req, res) => {
  try {
    const fixedDeparture = await FixedDeparture.findById(req.params.id);
    
    if (!fixedDeparture) {
      return res.status(404).json({ message: 'Fixed departure not found' });
    }
    
    res.json(fixedDeparture);
  } catch (error) {
    console.error('Error fetching fixed departure:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get fixed departure by slug
const getFixedDepartureBySlug = async (req, res) => {
  try {
    const fixedDeparture = await FixedDeparture.findOne({ 
      slug: req.params.slug,
      isActive: true 
    });
    
    if (!fixedDeparture) {
      return res.status(404).json({ message: 'Fixed departure not found' });
    }
    
    res.json(fixedDeparture);
  } catch (error) {
    console.error('Error fetching fixed departure by slug:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Create new fixed departure
const createFixedDeparture = async (req, res) => {
  try {
    const {
      title,
      slug,
      description,
      shortDescription,
      price,
      originalPrice,
      discount,
      duration,
      destination,
      departureDate,
      returnDate,
      availableSeats,
      totalSeats,
      highlights,
      itinerary,
      inclusions,
      exclusions,
      terms,
      images
    } = req.body;

    // Check if slug already exists
    const existingFixedDeparture = await FixedDeparture.findOne({ slug });
    if (existingFixedDeparture) {
      return res.status(400).json({ message: 'Slug already exists' });
    }

    const fixedDeparture = new FixedDeparture({
      title,
      slug,
      description,
      shortDescription,
      price,
      originalPrice,
      discount,
      duration,
      destination,
      departureDate,
      returnDate,
      availableSeats,
      totalSeats,
      highlights,
      itinerary,
      inclusions,
      exclusions,
      terms,
      images: images || []
    });

    await fixedDeparture.save();
    res.status(201).json(fixedDeparture);
  } catch (error) {
    console.error('Error creating fixed departure:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update fixed departure
const updateFixedDeparture = async (req, res) => {
  try {
    const {
      title,
      slug,
      description,
      shortDescription,
      price,
      originalPrice,
      discount,
      duration,
      destination,
      departureDate,
      returnDate,
      availableSeats,
      totalSeats,
      highlights,
      itinerary,
      inclusions,
      exclusions,
      terms,
      images,
      isActive,
      isFeatured,
      status
    } = req.body;

    // Check if slug already exists for other fixed departures
    if (slug) {
      const existingFixedDeparture = await FixedDeparture.findOne({ 
        slug, 
        _id: { $ne: req.params.id } 
      });
      if (existingFixedDeparture) {
        return res.status(400).json({ message: 'Slug already exists' });
      }
    }

    const updatedFixedDeparture = await FixedDeparture.findByIdAndUpdate(
      req.params.id,
      {
        title,
        slug,
        description,
        shortDescription,
        price,
        originalPrice,
        discount,
        duration,
        destination,
        departureDate,
        returnDate,
        availableSeats,
        totalSeats,
        highlights,
        itinerary,
        inclusions,
        exclusions,
        terms,
        images,
        isActive,
        isFeatured,
        status
      },
      { new: true, runValidators: true }
    );

    if (!updatedFixedDeparture) {
      return res.status(404).json({ message: 'Fixed departure not found' });
    }

    res.json(updatedFixedDeparture);
  } catch (error) {
    console.error('Error updating fixed departure:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete fixed departure
const deleteFixedDeparture = async (req, res) => {
  try {
    const fixedDeparture = await FixedDeparture.findByIdAndDelete(req.params.id);
    
    if (!fixedDeparture) {
      return res.status(404).json({ message: 'Fixed departure not found' });
    }
    
    res.json({ message: 'Fixed departure deleted successfully' });
  } catch (error) {
    console.error('Error deleting fixed departure:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Toggle featured status
const toggleFeatured = async (req, res) => {
  try {
    const fixedDeparture = await FixedDeparture.findById(req.params.id);
    
    if (!fixedDeparture) {
      return res.status(404).json({ message: 'Fixed departure not found' });
    }
    
    fixedDeparture.isFeatured = !fixedDeparture.isFeatured;
    await fixedDeparture.save();
    
    res.json(fixedDeparture);
  } catch (error) {
    console.error('Error toggling featured status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Toggle active status
const toggleStatus = async (req, res) => {
  try {
    const fixedDeparture = await FixedDeparture.findById(req.params.id);
    
    if (!fixedDeparture) {
      return res.status(404).json({ message: 'Fixed departure not found' });
    }
    
    fixedDeparture.isActive = !fixedDeparture.isActive;
    await fixedDeparture.save();
    
    res.json(fixedDeparture);
  } catch (error) {
    console.error('Error toggling active status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get featured fixed departures
const getFeaturedFixedDepartures = async (req, res) => {
  try {
    const fixedDepartures = await FixedDeparture.find({ 
      isFeatured: true, 
      isActive: true 
    }).sort({ departureDate: 1 }).limit(6);
    
    res.json(fixedDepartures);
  } catch (error) {
    console.error('Error fetching featured fixed departures:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Search fixed departures
const searchFixedDepartures = async (req, res) => {
  try {
    const { q, destination, status, minPrice, maxPrice } = req.query;
    
    const query = { isActive: true };
    
    if (q) {
      query.$text = { $search: q };
    }
    
    if (destination) {
      query.destination = { $regex: destination, $options: 'i' };
    }
    
    if (status) {
      query.status = status;
    }
    
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    const fixedDepartures = await FixedDeparture.find(query)
      .sort({ departureDate: 1 })
      .limit(20);
    
    res.json(fixedDepartures);
  } catch (error) {
    console.error('Error searching fixed departures:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getAllFixedDepartures,
  getFixedDeparture,
  getFixedDepartureBySlug,
  createFixedDeparture,
  updateFixedDeparture,
  deleteFixedDeparture,
  toggleFeatured,
  toggleStatus,
  getFeaturedFixedDepartures,
  searchFixedDepartures
};
