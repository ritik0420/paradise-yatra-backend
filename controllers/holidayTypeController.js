const HolidayType = require('../models/HolidayType');

// Get all holiday types
const getAllHolidayTypes = async (req, res) => {
  try {
    const holidayTypes = await HolidayType.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
    res.json(holidayTypes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching holiday types', error: error.message });
  }
};

// Get all holiday types (admin)
const getAllHolidayTypesAdmin = async (req, res) => {
  try {
    const holidayTypes = await HolidayType.find().sort({ order: 1, createdAt: -1 });
    res.json(holidayTypes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching holiday types', error: error.message });
  }
};

// Get holiday type by ID
const getHolidayType = async (req, res) => {
  try {
    const holidayType = await HolidayType.findById(req.params.id);
    if (!holidayType) {
      return res.status(404).json({ message: 'Holiday type not found' });
    }
    res.json(holidayType);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching holiday type', error: error.message });
  }
};

// Get holiday type by slug
const getHolidayTypeBySlug = async (req, res) => {
  try {
    const holidayType = await HolidayType.findOne({ slug: req.params.slug, isActive: true });
    if (!holidayType) {
      return res.status(404).json({ message: 'Holiday type not found' });
    }
    res.json(holidayType);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching holiday type', error: error.message });
  }
};

// Create new holiday type
const createHolidayType = async (req, res) => {
  try {
    console.log('Creating holiday type with data:', req.body);
    console.log('User making request:', req.user);
    
    // Generate slug from title if not provided
    const holidayData = { ...req.body };
    if (!holidayData.slug) {
      holidayData.slug = holidayData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    
    const holidayType = new HolidayType(holidayData);
    await holidayType.save();
    console.log('Holiday type created successfully:', holidayType);
    res.status(201).json(holidayType);
  } catch (error) {
    console.error('Error creating holiday type:', error);
    if (error.code === 11000) {
      res.status(400).json({ message: 'Holiday type with this slug already exists' });
    } else {
      res.status(500).json({ message: 'Error creating holiday type', error: error.message });
    }
  }
};

// Update holiday type
const updateHolidayType = async (req, res) => {
  try {
    // Generate slug from title if title is being updated and slug is not provided
    const updateData = { ...req.body };
    if (updateData.title && !updateData.slug) {
      updateData.slug = updateData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    
    const holidayType = await HolidayType.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    if (!holidayType) {
      return res.status(404).json({ message: 'Holiday type not found' });
    }
    res.json(holidayType);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'Holiday type with this slug already exists' });
    } else {
      res.status(500).json({ message: 'Error updating holiday type', error: error.message });
    }
  }
};

// Delete holiday type
const deleteHolidayType = async (req, res) => {
  try {
    const holidayType = await HolidayType.findByIdAndDelete(req.params.id);
    if (!holidayType) {
      return res.status(404).json({ message: 'Holiday type not found' });
    }
    res.json({ message: 'Holiday type deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting holiday type', error: error.message });
  }
};

// Toggle holiday type active status
const toggleHolidayTypeStatus = async (req, res) => {
  try {
    const holidayType = await HolidayType.findById(req.params.id);
    if (!holidayType) {
      return res.status(404).json({ message: 'Holiday type not found' });
    }
    holidayType.isActive = !holidayType.isActive;
    await holidayType.save();
    res.json(holidayType);
  } catch (error) {
    res.status(500).json({ message: 'Error toggling holiday type status', error: error.message });
  }
};

// Toggle holiday type featured status
const toggleHolidayTypeFeatured = async (req, res) => {
  try {
    const holidayType = await HolidayType.findById(req.params.id);
    if (!holidayType) {
      return res.status(404).json({ message: 'Holiday type not found' });
    }
    holidayType.isFeatured = !holidayType.isFeatured;
    await holidayType.save();
    res.json(holidayType);
  } catch (error) {
    res.status(500).json({ message: 'Error toggling holiday type featured status', error: error.message });
  }
};

// Update holiday type order
const updateHolidayTypeOrder = async (req, res) => {
  try {
    const { order } = req.body;
    const holidayType = await HolidayType.findByIdAndUpdate(
      req.params.id,
      { order },
      { new: true }
    );
    if (!holidayType) {
      return res.status(404).json({ message: 'Holiday type not found' });
    }
    res.json(holidayType);
  } catch (error) {
    res.status(500).json({ message: 'Error updating holiday type order', error: error.message });
  }
};

module.exports = {
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
}; 