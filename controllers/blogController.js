const Blog = require('../models/Blog');

// Helper function to transform image paths to full URLs
const transformBlogImageUrl = (blog, req) => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  
  if (blog.image && !blog.image.startsWith('http')) {
    blog.image = `${baseUrl}/${blog.image}`;
  }
  
  return blog;
};

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

    // Transform image URLs
    const transformedBlogs = blogs.map(blog => transformBlogImageUrl(blog, req));

    res.json({
      blogs: transformedBlogs,
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

    // Transform image URL
    const transformedBlog = transformBlogImageUrl(blog, req);

    res.json(transformedBlog);
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
    
    // Transform image URL
    const transformedBlog = transformBlogImageUrl(blog, req);
    
    res.status(201).json({
      message: 'Blog created successfully',
      blog: transformedBlog
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

    // Transform image URL
    const transformedBlog = transformBlogImageUrl(blog, req);

    res.json({
      message: 'Blog updated successfully',
      blog: transformedBlog
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

    // Temporarily show all blogs for testing (including unpublished ones)
    const blogs = await Blog.find({})
      .sort({ isPublished: -1, isFeatured: -1, views: -1, createdAt: -1 }) // Published first, then featured, then by views
      .limit(parseInt(limit));

    // Transform image URLs
    const transformedBlogs = blogs.map(blog => transformBlogImageUrl(blog, req));

    res.json(transformedBlogs);
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
    
    // Transform image URLs
    const transformedBlogs = blogs.map(blog => transformBlogImageUrl(blog, req));
    
    res.json(transformedBlogs);
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