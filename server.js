const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  process.env.CLIENT_ORIGIN
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;


if (!MONGODB_URI) {
  console.error('MONGODB_URI environment variable is not set');
  process.exit(1);
}

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB Atlas successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
  }
};

// Connect to database
connectDB();

// Routes
const authRoutes = require('./routes/auth');
const packageRoutes = require('./routes/packages');
const destinationRoutes = require('./routes/destinations');
const blogRoutes = require('./routes/blogs');
const adminRoutes = require('./routes/admin');
const testimonialRoutes = require('./routes/testimonials');
const heroRoutes = require('./routes/hero');
const headerRoutes = require('./routes/header');
const ctaRoutes = require('./routes/cta');
const holidayTypeRoutes = require('./routes/holidayTypes');
const uploadRoutes = require('./routes/upload');
const fixedDepartureRoutes = require('./routes/fixedDepartures');
const footerRoutes = require('./routes/footer');
const locationRoutes = require('./routes/locations');
const seoRoutes = require('./routes/seo');
const faqRoutes = require('./routes/faq');

app.use('/api/auth', authRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/destinations', destinationRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/hero', heroRoutes);
app.use('/api/header', headerRoutes);
app.use('/api/cta', ctaRoutes);
app.use('/api/holiday-types', holidayTypeRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/fixed-departures', fixedDepartureRoutes);
app.use('/api/footer', footerRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/seo', seoRoutes);
app.use('/api/faq', faqRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Paradise Yatra API is running!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    
    const server = app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
    
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.log(`Port ${PORT} is busy, trying port ${PORT + 1}...`);
        const newPort = PORT + 1;
        app.listen(newPort, () => {
          console.log(`Server is running on port ${newPort}`);
        });
      } else {
        console.error('Server error:', error);
      }
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer(); 