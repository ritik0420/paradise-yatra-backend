const mongoose = require('mongoose');

const destinationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
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
  location: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  price: {
    type: Number,
    min: 0
  },
  duration: {
    type: String
  },
  highlights: [{
    type: String
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isTrending: {
    type: Boolean,
    default: false
  },
  visitCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Destination', destinationSchema); 