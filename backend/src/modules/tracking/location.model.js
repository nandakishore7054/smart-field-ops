const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema(
  {
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    accuracy: {
      type: Number, // in meters
    },
    speed: {
      type: Number, // in meters/second
    },
    heading: {
      type: Number, // 0-360 degrees
    },
    batteryLevel: {
      type: Number, // 0-100
    },
    isMoving: {
      type: Boolean,
      default: false,
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
locationSchema.index({ workerId: 1, timestamp: -1 });
locationSchema.index({ location: '2dsphere' });
// TTL index: expire documents 7 days after the timestamp
locationSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7 * 24 * 60 * 60 });

const WorkerLocation = mongoose.model('WorkerLocation', locationSchema);

module.exports = WorkerLocation;
