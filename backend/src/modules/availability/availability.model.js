const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema(
  {
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    dayOfWeek: {
      type: Number,
      required: true,
      min: 0,
      max: 6,
    },
    startTime: {
      type: String, // format 'HH:mm'
      required: true,
      match: /^([01]\d|2[0-3]):([0-5]\d)$/,
    },
    endTime: {
      type: String, // format 'HH:mm'
      required: true,
      match: /^([01]\d|2[0-3]):([0-5]\d)$/,
    },
    isRecurring: {
      type: Boolean,
      default: true,
    },
    effectiveFrom: {
      type: Date,
      default: Date.now,
    },
    effectiveUntil: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure one record per worker per day
availabilitySchema.index({ workerId: 1, dayOfWeek: 1 }, { unique: true });

module.exports = mongoose.model('WorkerAvailability', availabilitySchema);
