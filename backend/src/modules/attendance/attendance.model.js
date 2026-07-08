const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
    },
  },
  { _id: false }
);

const checkInOutSchema = new mongoose.Schema(
  {
    time: {
      type: Date,
      required: true,
    },
    location: locationSchema,
    method: {
      type: String,
      enum: ['gps', 'manual', 'auto'],
      default: 'gps',
    },
  },
  { _id: false }
);

const attendanceSchema = new mongoose.Schema(
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
    shiftId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shift',
      default: null,
    },
    checkIn: checkInOutSchema,
    checkOut: checkInOutSchema,
    totalHours: {
      type: Number,
      default: 0,
    },
    overtime: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['present', 'absent', 'late', 'half-day', 'on-leave'],
      default: 'present',
    },
  },
  {
    timestamps: true,
  }
);

// Enforce one attendance record per worker per day
attendanceSchema.index({ workerId: 1, date: 1 }, { unique: true });
attendanceSchema.index({ date: 1, status: 1 });

module.exports = mongoose.model('AttendanceRecord', attendanceSchema);
