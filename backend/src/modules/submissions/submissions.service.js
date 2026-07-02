const ApiError = require('../../core/utils/apiError');
const Task = require('../tasks/tasks.model');
const Submission = require('./submissions.model');
const { createSignedUploadPayload } = require('../../config/cloudinary');

function normalizeSubmission(submission) {
  return submission?.toObject ? submission.toObject() : submission;
}

async function getUploadSignature() {
  return createSignedUploadPayload({ folder: 'smart-field-ops/proofs' });
}

async function createSubmission(payload, workerId) {
  const task = await Task.findOne({ _id: payload.taskId, isDeleted: false });

  if (!task) {
    throw new ApiError(404, 'Task not found.');
  }

  if (!task.assignedTo || task.assignedTo.toString() !== workerId.toString()) {
    throw new ApiError(403, 'You can only submit proof for your assigned task.');
  }

  if (await Submission.exists({ taskId: task._id })) {
    throw new ApiError(409, 'A submission for this task already exists.');
  }

  if (task.status !== 'in-progress') {
    throw new ApiError(400, 'Task must be in progress before proof can be submitted.');
  }

  if (!Array.isArray(payload.images) || payload.images.length === 0) {
    throw new ApiError(400, 'At least one image is required.');
  }

  const submission = await Submission.create({
    taskId: task._id,
    workerId,
    images: payload.images,
    notes: payload.notes || '',
    submittedLocation: payload.submittedLocation,
  });

  task.status = 'completed';
  await task.save();

  return {
    submission: normalizeSubmission(submission),
    task: normalizeSubmission(task),
  };
}

async function getSubmissionForTask(taskId) {
  const submission = await Submission.findOne({ taskId })
    .populate('workerId', 'name email role')
    .populate('verifiedBy', 'name email role')
    .lean();

  return submission;
}

async function verifySubmission(taskId, adminId, payload) {
  const task = await Task.findOne({ _id: taskId, isDeleted: false });

  if (!task) {
    throw new ApiError(404, 'Task not found.');
  }

  const submission = await Submission.findOne({ taskId });

  if (!submission) {
    throw new ApiError(404, 'Submission not found.');
  }

  submission.isVerified = Boolean(payload.isVerified);
  submission.verifiedBy = adminId;
  submission.verificationFeedback = payload.verificationFeedback || '';
  await submission.save();

  task.status = payload.isVerified ? 'verified' : 'rejected';
  await task.save();

  return {
    submission: normalizeSubmission(submission),
    task: normalizeSubmission(task),
  };
}

module.exports = {
  getUploadSignature,
  createSubmission,
  getSubmissionForTask,
  verifySubmission,
};