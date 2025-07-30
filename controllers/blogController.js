const Blog = require('../models/Blog');

// Get all blogs
const getAllBlogs = async (req, res) => {
  try {
    const { category, featured, published, limit = 10, page = 1 } = req.query;
    
    let query = {};
    
    if (category) {
      query.category = category;
    }
    
    if (featured === 'true') {
      query.isFeatured = true;
    }
    
    if (published === 'true') {
      query.isPublished = true;
    }

    const blogs = await Blog.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Blog.countDocuments(query);

    res.json({
      blogs,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        hasNext: parseInt(page) * parseInt(limit) < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get blogs error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get single blog
const getBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found.' });
    }

    // Increment views
    blog.views += 1;
    await blog.save();

    res.json(blog);
  } catch (error) {
    console.error('Get blog error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Create blog (Admin only)
const createBlog = async (req, res) => {
  try {
    const blog = new Blog(req.body);
    await blog.save();
    
    res.status(201).json({
      message: 'Blog created successfully',
      blog
    });
  } catch (error) {
    console.error('Create blog error:', error);
    res.status(500).json({ message: 'Server error during blog creation.' });
  }
};

// Update blog (Admin only)
const updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found.' });
    }

    res.json({
      message: 'Blog updated successfully',
      blog
    });
  } catch (error) {
    console.error('Update blog error:', error);
    res.status(500).json({ message: 'Server error during blog update.' });
  }
};

// Delete blog (Admin only)
const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found.' });
    }

    res.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    console.error('Delete blog error:', error);
    res.status(500).json({ message: 'Server error during blog deletion.' });
  }
};

// Get featured blogs
const getFeaturedBlogs = async (req, res) => {
  try {
    const { limit = 6 } = req.query;

    const blogs = await Blog.find({ 
      isFeatured: true, 
      isPublished: true 
    })
    .sort({ views: -1, createdAt: -1 })
    .limit(parseInt(limit));

    res.json(blogs);
  } catch (error) {
    console.error('Get featured blogs error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Search blogs
const searchBlogs = async (req, res) => {
  try {
    const { q, category, author } = req.query;
    
    let query = { isPublished: true };
    
    if (q) {
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { content: { $regex: q, $options: 'i' } },
        { excerpt: { $regex: q, $options: 'i' } }
      ];
    }
    
    if (category) {
      query.category = category;
    }
    
    if (author) {
      query.author = { $regex: author, $options: 'i' };
    }

    const blogs = await Blog.find(query).sort({ views: -1, createdAt: -1 });
    res.json(blogs);
  } catch (error) {
    console.error('Search blogs error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Like blog
const likeBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found.' });
    }

    blog.likes += 1;
    await blog.save();

    res.json({
      message: 'Blog liked successfully',
      likes: blog.likes
    });
  } catch (error) {
    console.error('Like blog error:', error);
    res.status(500).json({ message: 'Server error during blog like.' });
  }
};

module.exports = {
  getAllBlogs,
  getBlog,
  createBlog,
  updateBlog,
  deleteBlog,
  getFeaturedBlogs,
  searchBlogs,
  likeBlog
}; 