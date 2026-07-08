const mongoose = require('mongoose');

const geofenceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['polygon', 'circle'],
      required: true,
    },
    category: {
      type: String,
      enum: ['office', 'customer', 'general'],
      default: 'general',
    },
    boundary: {
      type: {
        type: String,
        enum: ['Polygon'],
        required: function () {
          return this.type === 'polygon';
        },
      },
      coordinates: {
        type: [[[Number]]], // Array of arrays of coordinates for Polygon
        required: function () {
          return this.type === 'polygon';
        },
      },
    },
    center: {
      type: {
        type: String,
        enum: ['Point'],
        required: function () {
          return this.type === 'circle';
        },
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: function () {
          return this.type === 'circle';
        },
      },
    },
    radius: {
      type: Number, // In meters, used when type is 'circle'
      required: function () {
        return this.type === 'circle';
      },
    },
    rules: {
      type: mongoose.Schema.Types.Mixed, // e.g. { autoCheckIn: true, speedLimit: 30 }
      default: {},
    },
    linkedTasks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Geospatial indexes
geofenceSchema.index({ boundary: '2dsphere' });
geofenceSchema.index({ center: '2dsphere' });

const Geofence = mongoose.model('Geofence', geofenceSchema);

module.exports = Geofence;
