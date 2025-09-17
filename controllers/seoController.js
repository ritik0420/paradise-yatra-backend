const SEOSettings = require('../models/SEOSettings');

// Get SEO settings for a specific page
const getSEOSettings = async (req, res) => {
  try {
    const { page } = req.params;
    
    let seoSettings = await SEOSettings.findOne({ page: page.toLowerCase() });
    
    // If no settings exist, return default for homepage
    if (!seoSettings && page === 'homepage') {
      seoSettings = {
        page: 'homepage',
        title: 'Paradise Yatra - Your Trusted Travel Partner | Best Travel Agency in Dehradun',
        description: 'Discover the world with Paradise Yatra, the best travel agency in Dehradun. We offer customized international and domestic tour packages, trekking adventures, and unforgettable travel experiences. 5000+ happy travelers, 25+ countries covered.',
        keywords: [
          'travel agency Dehradun',
          'best travel agency Dehradun', 
          'international tours',
          'India tour packages',
          'trekking adventures',
          'travel packages',
          'vacation packages',
          'Paradise Yatra',
          'travel booking',
          'adventure travel'
        ],
        ogImage: '/hero.jpg',
        canonical: '/',
        robots: 'index,follow'
      };
    }
    
    if (!seoSettings) {
      return res.status(404).json({ 
        success: false, 
        message: 'SEO settings not found for this page' 
      });
    }
    
    res.json({
      success: true,
      data: seoSettings
    });
  } catch (error) {
    console.error('Error fetching SEO settings:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

// Create or update SEO settings for a page
const updateSEOSettings = async (req, res) => {
  try {
    const { page } = req.params;
    const updateData = req.body;
    
    // Validate required fields
    if (!updateData.title || !updateData.description) {
      return res.status(400).json({
        success: false,
        message: 'Title and description are required'
      });
    }
    
    // Validate title length
    if (updateData.title.length > 60) {
      return res.status(400).json({
        success: false,
        message: 'Title should be 60 characters or less'
      });
    }
    
    // Validate description length
    if (updateData.description.length > 160) {
      return res.status(400).json({
        success: false,
        message: 'Description should be 160 characters or less'
      });
    }
    
    // Ensure page field matches the URL parameter
    updateData.page = page.toLowerCase();
    updateData.lastUpdated = new Date();
    
    const seoSettings = await SEOSettings.findOneAndUpdate(
      { page: page.toLowerCase() },
      updateData,
      { 
        upsert: true, 
        new: true, 
        runValidators: true 
      }
    );
    
    res.json({
      success: true,
      message: 'SEO settings updated successfully',
      data: seoSettings
    });
  } catch (error) {
    console.error('Error updating SEO settings:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

// Get all SEO settings
const getAllSEOSettings = async (req, res) => {
  try {
    const seoSettings = await SEOSettings.find({}).sort({ page: 1 });
    
    res.json({
      success: true,
      data: seoSettings
    });
  } catch (error) {
    console.error('Error fetching all SEO settings:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

// Delete SEO settings for a page
const deleteSEOSettings = async (req, res) => {
  try {
    const { page } = req.params;
    
    const seoSettings = await SEOSettings.findOneAndDelete({ page: page.toLowerCase() });
    
    if (!seoSettings) {
      return res.status(404).json({
        success: false,
        message: 'SEO settings not found for this page'
      });
    }
    
    res.json({
      success: true,
      message: 'SEO settings deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting SEO settings:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

module.exports = {
  getSEOSettings,
  updateSEOSettings,
  getAllSEOSettings,
  deleteSEOSettings
};
