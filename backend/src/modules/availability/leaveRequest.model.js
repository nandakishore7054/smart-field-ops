const mongoose = require('mongoose');

const leaveRequestSchema = new mongoose.Schema(
  {
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['sick', 'personal', 'vacation', 'emergency'],
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    reason: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

leaveRequestSchema.index({ workerId: 1, startDate: 1 });
leaveRequestSchema.index({ status: 1 });

module.exports = mongoose.model('LeaveRequest', leaveRequestSchema);
