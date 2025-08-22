const path = require('path');
const fs = require('fs');

// Upload single image
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    // Create the image URL using BACKEND_URL for static file serving
    const baseUrl = process.env.BACKEND_URL || '';
    const imageUrl = baseUrl ? `${baseUrl}/uploads/${req.file.filename}` : `/uploads/${req.file.filename}`;
    
    res.status(200).json({
      message: 'Image uploaded successfully',
      imageUrl: imageUrl,
      filename: req.file.filename
    });
  } catch (error) {
    console.error('Upload image error:', error);
    res.status(500).json({ message: 'Server error during image upload' });
  }
};

// Delete image
const deleteImage = async (req, res) => {
  try {
    const { filename } = req.params;
    
    if (!filename) {
      return res.status(400).json({ message: 'Filename is required' });
    }

    const filePath = path.join(__dirname, '..', 'uploads', filename);
    
    // Check if file exists
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({ message: 'Image deleted successfully' });
    } else {
      res.status(404).json({ message: 'Image not found' });
    }
  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({ message: 'Server error during image deletion' });
  }
};

// Get all uploaded images (for admin panel)
const getAllImages = async (req, res) => {
  try {
    const uploadsDir = path.join(__dirname, '..', 'uploads');
    
    if (!fs.existsSync(uploadsDir)) {
      return res.json({ images: [] });
    }

    const files = fs.readdirSync(uploadsDir);
    const baseUrl = process.env.BACKEND_URL || '';
    
    const images = files
      .filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
      })
      .map(file => ({
        filename: file,
        url: baseUrl ? `${baseUrl}/uploads/${file}` : `/uploads/${file}`,
        size: fs.statSync(path.join(uploadsDir, file)).size
      }));

    res.json({ images });
  } catch (error) {
    console.error('Get images error:', error);
    res.status(500).json({ message: 'Server error while fetching images' });
  }
};

module.exports = {
  uploadImage,
  deleteImage,
  getAllImages
};
