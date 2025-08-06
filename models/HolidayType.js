const mongoose = require('mongoose');

const holidayTypeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: false,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  shortDescription: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  bgColor: {
    type: String,
    default: "bg-gradient-to-br from-blue-400 to-blue-600"
  },
  duration: {
    type: String,
    required: true
  },
  travelers: {
    type: String,
    required: true
  },
  badge: {
    type: String,
    required: true
  },
  price: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  order: {
    type: Number,
    default: 0
  },
  itinerary: [{
    day: {
      type: Number,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    activities: [{
      type: String,
      required: true
    }],
    accommodation: {
      type: String,
      required: true
    },
    meals: {
      type: String,
      required: true
    },
    image: {
      type: String,
      default: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    }
  }]
}, {
  timestamps: true
});

// Create slug from title
holidayTypeSchema.pre('save', function(next) {
  if (this.isModified('title') || !this.slug) {
    this.slug = this.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  next();
});

module.exports = mongoose.model('HolidayType', holidayTypeSchema); 