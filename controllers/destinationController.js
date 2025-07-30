const Destination = require('../models/Destination');

// Get all destinations
const getAllDestinations = async (req, res) => {
  try {
    const { trending, limit = 10, page = 1 } = req.query;
    
    let query = { isActive: true };
    
    if (trending === 'true') {
      query.isTrending = true;
    }

    const destinations = await Destination.find(query)
      .sort({ visitCount: -1, createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Destination.countDocuments(query);

    res.json({
      destinations,
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

    res.json(destination);
  } catch (error) {
    console.error('Get destination error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Create destination (Admin only)
const createDestination = async (req, res) => {
  try {
    const destination = new Destination(req.body);
    await destination.save();
    
    res.status(201).json({
      message: 'Destination created successfully',
      destination
    });
  } catch (error) {
    console.error('Create destination error:', error);
    res.status(500).json({ message: 'Server error during destination creation.' });
  }
};

// Update destination (Admin only)
const updateDestination = async (req, res) => {
  try {
    const destination = await Destination.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!destination) {
      return res.status(404).json({ message: 'Destination not found.' });
    }

    res.json({
      message: 'Destination updated successfully',
      destination
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

    res.json(destinations);
  } catch (error) {
    console.error('Get trending destinations error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Search destinations
const searchDestinations = async (req, res) => {
  try {
    const { q, location } = req.query;
    
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

    const destinations = await Destination.find(query).sort({ visitCount: -1 });
    res.json(destinations);
  } catch (error) {
    console.error('Search destinations error:', error);
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
  searchDestinations
}; 