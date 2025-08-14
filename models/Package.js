const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
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
  price: {
    type: Number,
    required: true,
    min: 0
  },
  originalPrice: {
    type: Number,
    min: 0
  },
  discount: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  duration: {
    type: String,
    required: true
  },
  destination: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['premium', 'adventure', 'holiday', 'trending', 'international', 'india'],
    required: true
  },
  images: [{
    type: String,
    required: true
  }],
  highlights: [{
    type: String
  }],
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
  }],
  inclusions: [{
    type: String
  }],
  exclusions: [{
    type: String
  }],
  terms: [{
    type: String
  }],
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Virtual for discounted price
packageSchema.virtual('discountedPrice').get(function() {
  if (this.discount > 0) {
    return this.price - (this.price * this.discount / 100);
  }
  return this.price;
});

// Ensure virtual fields are serialized
packageSchema.set('toJSON', { virtuals: true });
packageSchema.set('toObject', { virtuals: true });

// Add indexes for better search performance
packageSchema.index({ title: 'text', description: 'text', destination: 'text' });
packageSchema.index({ isActive: 1 });
packageSchema.index({ title: 1 });
packageSchema.index({ destination: 1 });
packageSchema.index({ category: 1 });

module.exports = mongoose.model('Package', packageSchema); 