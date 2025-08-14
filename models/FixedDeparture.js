const mongoose = require('mongoose');

const fixedDepartureSchema = new mongoose.Schema({
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
  departureDate: {
    type: Date,
    required: true
  },
  returnDate: {
    type: Date,
    required: true
  },
  availableSeats: {
    type: Number,
    required: true,
    min: 1
  },
  totalSeats: {
    type: Number,
    required: true,
    min: 1
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
  },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming'
  }
}, {
  timestamps: true
});

// Virtual for discounted price
fixedDepartureSchema.virtual('discountedPrice').get(function() {
  if (this.discount > 0) {
    return this.price - (this.price * this.discount / 100);
  }
  return this.price;
});

// Virtual for seats remaining
fixedDepartureSchema.virtual('seatsRemaining').get(function() {
  return this.availableSeats;
});

// Virtual for booking percentage
fixedDepartureSchema.virtual('bookingPercentage').get(function() {
  return ((this.totalSeats - this.availableSeats) / this.totalSeats) * 100;
});

// Ensure virtual fields are serialized
fixedDepartureSchema.set('toJSON', { virtuals: true });
fixedDepartureSchema.set('toObject', { virtuals: true });

// Add indexes for better search performance
fixedDepartureSchema.index({ title: 'text', description: 'text', destination: 'text' });
fixedDepartureSchema.index({ isActive: 1 });
fixedDepartureSchema.index({ title: 1 });
fixedDepartureSchema.index({ destination: 1 });
fixedDepartureSchema.index({ departureDate: 1 });
fixedDepartureSchema.index({ status: 1 });

module.exports = mongoose.model('FixedDeparture', fixedDepartureSchema);
