const mongoose = require('mongoose');

const submittedLocationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number],
      default: undefined,
    },
  },
  { _id: false }
);

const submissionSchema = new mongoose.Schema(
  {
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      required: true,
      unique: true,
    },
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    images: {
      type: [String],
      default: [],
      validate: {
        validator(values) {
          return Array.isArray(values) && values.length > 0;
        },
        message: 'At least one image is required.',
      },
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    submittedLocation: {
      type: submittedLocationSchema,
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    verificationFeedback: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

submissionSchema.index({ workerId: 1, createdAt: -1 });

module.exports = mongoose.model('Submission', submissionSchema);