const mongoose = require('mongoose');

const customerVisitSchema = new mongoose.Schema(
  {
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    geofenceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Geofence',
      required: true,
    },
    arrivalTime: {
      type: Date,
      required: true,
    },
    departureTime: {
      type: Date,
    },
    durationMs: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast querying by worker, geofence, and date ranges
customerVisitSchema.index({ workerId: 1, arrivalTime: -1 });
customerVisitSchema.index({ geofenceId: 1, arrivalTime: -1 });

const CustomerVisit = mongoose.model('CustomerVisit', customerVisitSchema);

module.exports = CustomerVisit;
