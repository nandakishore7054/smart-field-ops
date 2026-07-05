const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema(
  {
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    waypoints: [
      {
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
        timestamp: {
          type: Date,
          required: true,
        },
        isTaskStop: {
          type: Boolean,
          default: false,
        },
        taskId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Task',
        },
      },
    ],
    totalDistance: {
      type: Number, // in meters
      default: 0,
    },
    optimizedOrder: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes
routeSchema.index({ workerId: 1, date: -1 }, { unique: true });

const Route = mongoose.model('Route', routeSchema);

module.exports = Route;
