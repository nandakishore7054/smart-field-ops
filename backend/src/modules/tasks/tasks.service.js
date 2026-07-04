const Task = require('./tasks.model');
const User = require('../auth/auth.model');
const ApiError = require('../../core/utils/apiError');
const Submission = require('../submissions/submissions.model');
const { createNotification } = require('../notifications/notifications.service');
const { sendEmail } = require('../../config/mailer');

async function assertValidAssignee(assignedTo) {
  if (!assignedTo) {
    return null;
  }

  const worker = await User.findById(assignedTo).select('role status name email');

  if (!worker || worker.role !== 'worker' || worker.status !== 'active') {
    throw new ApiError(400, 'Assigned worker must be an active worker account.');
  }

  return worker._id;
}

function normalizeTaskDocument(task) {
  if (!task) {
    return null;
  }

  const plainTask = task.toObject ? task.toObject() : { ...task };
  return plainTask;
}

function normalizeSubmission(submission) {
  if (!submission) {
    return null;
  }

  return submission.toObject ? submission.toObject() : { ...submission };
}

async function createTask(payload, actorId) {
  const assignedTo = await assertValidAssignee(payload.assignedTo || null);
  let worker = null;
  if (assignedTo) {
    worker = await User.findById(assignedTo).lean();
  }

  const task = await Task.create({
    title: payload.title,
    description: payload.description || '',
    priority: payload.priority,
    deadline: payload.deadline,
    locationAddress: payload.locationAddress || '',
    locationCoordinates: payload.locationCoordinates || null,
    assignedTo,
    createdBy: actorId,
    status: assignedTo ? 'assigned' : 'unassigned',
  });

  const normalizedTask = normalizeTaskDocument(task);

  if (worker) {
    const notification = await createNotification({
      userId: worker._id,
      message: `You have been assigned a new task: ${task.title}`,
      type: 'task:created',
      relatedTaskId: task._id,
    });

    if (global.io) {
      global.io.to(worker._id.toString()).emit('task:created', { task: normalizedTask, notification });
    }

    sendEmail({
      to: worker.email,
      subject: 'New Task Assigned',
      text: `You have been assigned a new task: ${task.title}. Priority: ${task.priority}.`,
    });
  }

  return normalizedTask;
}

async function getTasks({ page, limit, status, search, priority, sort }) {
  const filter = { isDeleted: false };

  if (status) {
    filter.status = status;
  }
  
  if (priority) {
    filter.priority = priority;
  }

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { locationAddress: { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (page - 1) * limit;

  const [tasks, total] = await Promise.all([
    Task.find(filter)
      .populate('assignedTo', 'name email status role')
      .populate('createdBy', 'name email role')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Task.countDocuments(filter),
  ]);

  return {
    tasks,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      hasNextPage: skip + tasks.length < total,
      hasPrevPage: page > 1,
    },
  };
}

async function getMyTasks(workerId) {
  const tasks = await Task.find({
    assignedTo: workerId,
    isDeleted: false,
  })
    .populate('assignedTo', 'name email status role')
    .populate('createdBy', 'name email role')
    .sort({ deadline: 1, createdAt: -1 })
    .lean();

  return { tasks };
}

async function getTaskById(taskId) {
  const task = await Task.findOne({ _id: taskId, isDeleted: false })
    .populate('assignedTo', 'name email status role')
    .populate('createdBy', 'name email role')
    .lean();

  if (!task) {
    throw new ApiError(404, 'Task not found.');
  }

  const submission = await Submission.findOne({ taskId: task._id })
    .populate('workerId', 'name email role')
    .populate('verifiedBy', 'name email role')
    .lean();

  if (submission) {
    task.submission = submission;
  }

  return task;
}

async function updateTask(taskId, payload) {
  const task = await Task.findOne({ _id: taskId, isDeleted: false });

  if (!task) {
    throw new ApiError(404, 'Task not found.');
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'assignedTo')) {
    const assignedTo = await assertValidAssignee(payload.assignedTo || null);
    task.assignedTo = assignedTo;
    task.status = assignedTo ? 'assigned' : 'unassigned';
  }

  if (payload.title !== undefined) task.title = payload.title;
  if (payload.description !== undefined) task.description = payload.description;
  if (payload.priority !== undefined) task.priority = payload.priority;
  if (payload.deadline !== undefined) task.deadline = payload.deadline;
  if (payload.locationAddress !== undefined) task.locationAddress = payload.locationAddress;
  if (payload.locationCoordinates !== undefined) task.locationCoordinates = payload.locationCoordinates;
  if (payload.status !== undefined) task.status = payload.status;

  await task.save();
  return normalizeTaskDocument(task);
}

async function deleteTask(taskId) {
  const task = await Task.findOne({ _id: taskId, isDeleted: false });

  if (!task) {
    throw new ApiError(404, 'Task not found.');
  }

  task.isDeleted = true;
  task.deletedAt = new Date();
  await task.save();

  return normalizeTaskDocument(task);
}

async function verifyTask(taskId, adminId, payload) {
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

  const worker = await User.findById(task.assignedTo).lean();
  if (worker) {
    const statusText = payload.isVerified ? 'verified' : 'rejected';
    const notification = await createNotification({
      userId: worker._id,
      message: `Your submission for task "${task.title}" was ${statusText}.`,
      type: 'task:verified',
      relatedTaskId: task._id,
    });

    if (global.io) {
      global.io.to(worker._id.toString()).emit('task:verified', {
        task: normalizeTaskDocument(task),
        notification,
      });
    }

    sendEmail({
      to: worker.email,
      subject: `Task Submission ${statusText.charAt(0).toUpperCase() + statusText.slice(1)}`,
      text: `Your submission for task "${task.title}" has been ${statusText}. Feedback: ${payload.verificationFeedback || 'None'}`,
    });
  }

  return {
    task: normalizeTaskDocument(task),
    submission: normalizeSubmission(submission),
  };
}

async function updateTaskStatus(taskId, workerId, nextStatus) {
  const task = await Task.findOne({ _id: taskId, isDeleted: false });

  if (!task) {
    throw new ApiError(404, 'Task not found.');
  }

  if (!task.assignedTo || task.assignedTo.toString() !== workerId.toString()) {
    throw new ApiError(403, 'You can only update tasks assigned to you.');
  }

  if (task.status !== 'assigned' || nextStatus !== 'in-progress') {
    throw new ApiError(400, 'Invalid task status transition.');
  }

  task.status = nextStatus;
  await task.save();

  return normalizeTaskDocument(task);
}

module.exports = {
  createTask,
  getTasks,
  getMyTasks,
  getTaskById,
  updateTask,
  deleteTask,
  verifyTask,
  updateTaskStatus,
};