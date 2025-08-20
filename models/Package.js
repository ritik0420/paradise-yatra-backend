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
  // Updated category enum to match the centralized config
  category: {
    type: String,
    enum: ['Beach Holidays', 'Adventure Tours', 'Trending Destinations', 'Premium Packages', 'Popular Packages', 'Fixed Departure', 'Mountain Treks', 'Wildlife Safaris', 'Pilgrimage Tours', 'Honeymoon Packages', 'Family Tours', 'Luxury Tours', 'Budget Tours'],
    required: true
  },
  // New field: Reference to HolidayType for better categorization
  holidayType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HolidayType',
    required: false
  },
  // New field: Country for international/national classification
  country: {
    type: String,
    required: true,
    trim: true
  },
  // New field: State for India tours
  state: {
    type: String,
    required: false,
    trim: true
  },
  // New field: Tour type classification
  tourType: {
    type: String,
    enum: ['international', 'india'],
    required: true,
    default: 'india'
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
packageSchema.index({ holidayType: 1 });
packageSchema.index({ country: 1 });
packageSchema.index({ state: 1 });
packageSchema.index({ tourType: 1 });
packageSchema.index({ tourType: 1, country: 1 }); // Compound index for tour type + country filtering
packageSchema.index({ tourType: 1, state: 1 }); // Compound index for tour type + state filtering
packageSchema.index({ country: 1, state: 1 }); // Compound index for country + state filtering

module.exports = mongoose.model('Package', packageSchema); 