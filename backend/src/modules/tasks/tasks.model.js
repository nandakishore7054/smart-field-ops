const mongoose = require('mongoose');

const locationCoordinatesSchema = new mongoose.Schema(
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

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      required: true,
      default: 'medium',
    },
    deadline: {
      type: Date,
      required: true,
    },
    locationAddress: {
      type: String,
      trim: true,
      default: '',
    },
    locationCoordinates: {
      type: locationCoordinatesSchema,
      default: null,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['unassigned', 'assigned', 'in-progress', 'completed', 'verified'],
      default: 'unassigned',
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

taskSchema.index({ assignedTo: 1, status: 1 });
taskSchema.index({ status: 1, deadline: 1 });
taskSchema.index({ locationCoordinates: '2dsphere' });
taskSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Task', taskSchema);