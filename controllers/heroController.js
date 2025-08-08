const HeroContent = require('../models/HeroContent');

// Helper function to transform image paths to full URLs
const transformHeroImageUrl = (heroContent, req) => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  
  if (heroContent.backgroundImage && !heroContent.backgroundImage.startsWith('http')) {
    // Remove leading slash to avoid double slashes
    const cleanImagePath = heroContent.backgroundImage.startsWith('/') ? heroContent.backgroundImage.substring(1) : heroContent.backgroundImage;
    heroContent.backgroundImage = `${baseUrl}/${cleanImagePath}`;
  }
  
  return heroContent;
};

// Get active hero content
const getHeroContent = async (req, res) => {
  try {
    const heroContent = await HeroContent.findOne({ isActive: true });
    if (!heroContent) {
      // Return default content if none exists
      return res.json({
        title: "Your Next Adventure Awaits",
        subtitle: "Unforgettable journeys, handpicked for you",
        description: "Explore, dream, and discover with Paradise Yatra.",
        backgroundImage: "https://wallpapercave.com/wp/wp10918600.jpg",
        trustBadgeText: "Trusted by 5000+ travelers",
        popularDestinations: ["Himachal Pradesh", "Uttarakhand", "Bali", "Europe", "Goa"],
        ctaButtonText: "Explore Packages",
        secondaryButtonText: "Watch Video"
      });
    }
    
    // Transform image URL
    const transformedHeroContent = transformHeroImageUrl(heroContent, req);
    
    res.json(transformedHeroContent);
  } catch (error) {
    console.error('Get hero content error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create hero content (Admin only)
const createHeroContent = async (req, res) => {
  try {
    // Deactivate existing hero content
    await HeroContent.updateMany({}, { isActive: false });
    
    const heroContent = new HeroContent(req.body);
    await heroContent.save();
    
    // Transform image URL
    const transformedHeroContent = transformHeroImageUrl(heroContent, req);
    
    res.status(201).json(transformedHeroContent);
  } catch (error) {
    console.error('Create hero content error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update hero content (Admin only)
const updateHeroContent = async (req, res) => {
  try {
    const heroContent = await HeroContent.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!heroContent) {
      return res.status(404).json({ message: 'Hero content not found' });
    }
    
    // Transform image URL
    const transformedHeroContent = transformHeroImageUrl(heroContent, req);
    
    res.json(transformedHeroContent);
  } catch (error) {
    console.error('Update hero content error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete hero content (Admin only)
const deleteHeroContent = async (req, res) => {
  try {
    const heroContent = await HeroContent.findByIdAndDelete(req.params.id);
    if (!heroContent) {
      return res.status(404).json({ message: 'Hero content not found' });
    }
    res.json({ message: 'Hero content deleted successfully' });
  } catch (error) {
    console.error('Delete hero content error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getHeroContent,
  createHeroContent,
  updateHeroContent,
  deleteHeroContent
};